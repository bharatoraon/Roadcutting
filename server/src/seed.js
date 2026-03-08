import "dotenv/config";
import { pool } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tj from "@mapbox/togeojson";
import { DOMParser } from "xmldom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const client = await pool.connect();
  try {
    console.log("--- STARTING SEED ---");

    // 1. ROADS
    console.log("Seeding Roads...");
    await client.query("DELETE FROM roads");
    await client.query("DELETE FROM applications");

    // Ensure schema allows all geometry types
    try {
      await client.query(
        "ALTER TABLE roads ALTER COLUMN geom TYPE GEOMETRY(Geometry, 4326)",
      );
    } catch (e) {
      console.log("Schema update skipped:", e.message);
    }

    const kmlPath = path.join(__dirname, "../../Data/chennairoads.kml");
    if (fs.existsSync(kmlPath)) {
      const kmlContent = fs.readFileSync(kmlPath, "utf8");
      const kml = new DOMParser().parseFromString(kmlContent);
      const geojson = tj.kml(kml);
      console.log(`Found ${geojson.features.length} roads.`);

      let successCount = 0;
      for (const feature of geojson.features) {
        if (!feature.geometry || !feature.properties) continue;
        const name =
          feature.properties.road_name ||
          feature.properties.name ||
          feature.properties.Ob ||
          "Unnamed Road";
        const owner = "GCC";
        const surface = "Bitumen";
        const geometry = JSON.stringify(feature.geometry);
        try {
          // USE ST_Force2D
          await client.query(
            `INSERT INTO roads (name, owner, surface_type, geom) 
                         VALUES ($1, $2, $3, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)))`,
            [name, owner, surface, geometry],
          );
          successCount++;
        } catch (e) {
          console.error("Road insert failed:", e.message);
        }
        if (successCount % 5000 === 0)
          console.log(`Inserted ${successCount} roads...`);
      }
      console.log(`Seeded ${successCount} roads.`);
    } else {
      console.error("Roads KML not found.");
    }

    // 2. REGIONS
    await seedKML(client, "regions", "../../Data/chennairegion.kml", {
      name: "name",
    });

    // 3. WARDS
    await seedKML(client, "wards", "../../Data/chennaiwards.kml", {
      name: "name",
    });
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    client.release();
    process.exit();
  }
}

async function seedKML(client, tableName, relativePath, propMap) {
  try {
    console.log(`Seeding ${tableName}...`);
    await client.query(`DELETE FROM ${tableName}`);
    const kmlPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(kmlPath)) {
      console.log(`Skipping ${tableName} - file not found at ${kmlPath}`);
      return;
    }

    const kmlContent = fs.readFileSync(kmlPath, "utf8");
    const kml = new DOMParser().parseFromString(kmlContent);
    const geojson = tj.kml(kml);
    console.log(`Found ${geojson.features.length} features for ${tableName}.`);

    let count = 0;
    for (const feature of geojson.features) {
      if (!feature.geometry) continue;

      let name = "Unnamed";
      if (propMap.name && feature.properties[propMap.name]) {
        name = feature.properties[propMap.name].toString().trim();
      } else if (feature.properties.Name) {
        name = feature.properties.Name.toString().trim();
      }

      const geometry = JSON.stringify(feature.geometry);

      try {
        // USE ST_Force2D
        await client.query(
          `INSERT INTO ${tableName} (name, geom) 
                     VALUES ($1, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)))`,
          [name, geometry],
        );
        count++;
      } catch (e) {
        console.error(`Failed to insert ${tableName} feature:`, e.message);
      }
    }
    console.log(`Seeded ${count} ${tableName}.`);
  } catch (e) {
    console.error(`Error processing ${tableName}:`, e);
  }
}

seed();
