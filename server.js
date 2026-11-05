
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
    res.json({
        status: "online",
        project: "VallVoice"
    });
});

app.post("/create-room", async (req, res) => {
    try {
        const { robloxUserId } = req.body;

        if (!robloxUserId) {
            return res.status(400).json({
                error: "Missing Roblox User ID"
            });
        }

        const pairCode = crypto
            .randomInt(100000, 999999)
            .toString();

        const { error } = await supabase
            .from("voice_rooms")
            .insert({
                pair_code: pairCode,
                roblox_user_id: String(robloxUserId),
                expires_at: new Date(
                    Date.now() + 5 * 60 * 1000
                ).toISOString()
            });

        if (error) throw error;

        res.json({
            success: true,
            code: pairCode,
            expiresIn: 300
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not create pairing code"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`VallVoice running on port ${PORT}`);
});
