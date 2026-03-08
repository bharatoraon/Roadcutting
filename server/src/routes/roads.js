import express from "express";
const router = express.Router();
import { pool } from "../db.js";

// GET /api/roads - Get all roads as GeoJSON FeatureCollection
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        owner, 
        surface_type, 
        ST_AsGeoJSON(geom) as geometry 
      FROM roads
    `;
    const { rows } = await pool.query(query);

    const features = rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: {
        id: row.id,
        name: row.name,
        owner: row.owner,
        surface_type: row.surface_type,
      },
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
