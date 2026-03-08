import express from "express";
const router = express.Router();
import { pool } from "../db.js";
import { authenticate } from "./auth.js";

// GET /api/applications - Get all applications
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.purpose, 
        a.status, 
        a.start_date, 
        a.end_date, 
        u.name as user_name,
        ST_AsGeoJSON(a.geom) as geometry 
      FROM applications a
      JOIN users u ON a.user_id = u.id
    `;
    const { rows } = await pool.query(query);

    const features = rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: {
        id: row.id,
        purpose: row.purpose,
        status: row.status,
        user_name: row.user_name,
        start_date: row.start_date,
        end_date: row.end_date,
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

// POST /api/applications - Create new application
router.post("/", authenticate, async (req, res) => {
  const { purpose, start_date, end_date, geometry } = req.body;
  const user_id = req.user.id;

  if (!geometry) {
    return res.status(400).json({ error: "Geometry is required" });
  }

  try {
    const query = `
      INSERT INTO applications (user_id, purpose, start_date, end_date, geom)
      VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))
      RETURNING id, status
    `;
    const values = [
      user_id,
      purpose,
      start_date,
      end_date,
      JSON.stringify(geometry),
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Test route to verify routing works
router.get("/:id/status", async (req, res) => {
  res.json({ message: "GET status route works", id: req.params.id });
});

// PATCH /api/applications/:id/status - Update application status
router.patch("/:id/status", async (req, res) => {
  console.log("PATCH route hit!", req.params, req.body);
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const query =
      "UPDATE applications SET status = $1 WHERE id = $2 RETURNING *";
    const { rows } = await pool.query(query, [status, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
