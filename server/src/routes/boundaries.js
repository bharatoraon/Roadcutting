import express from "express";
const router = express.Router();
import { pool } from "../db.js";

// GET /api/boundaries/regions
router.get("/regions", async (req, res) => {
  try {
    const query = `
            SELECT id, name, ST_AsGeoJSON(geom) as geometry 
            FROM regions
        `;
    const { rows } = await pool.query(query);
    const features = rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: { id: row.id, name: row.name },
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/boundaries/wards
router.get("/wards", async (req, res) => {
  try {
    const query = `
            SELECT id, name, ST_AsGeoJSON(geom) as geometry 
            FROM wards
        `;
    const { rows } = await pool.query(query);
    const features = rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: { id: row.id, name: row.name },
    }));
    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
