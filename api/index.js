const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/api/queue", async (req, res) => {
  const { data, error } = await supabase.rpc("get_queue_state");

  if (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถอ่านสถานะคิวได้"
    });
  }

  return res.json(data);
});

app.post("/api/queue/next", async (req, res) => {
  const { data, error } = await supabase.rpc("next_ticket");

  if (error) {
    console.error("next_ticket ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถรับบัตรคิวได้"
    });
  }

  return res.status(201).json(data);
});

app.post("/api/queue/reset", async (req, res) => {
  const { data, error } = await supabase.rpc("reset_queue");

  if (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถล้างคิวได้"
    });
  }

  return res.json(data);
});

module.exports = app;
