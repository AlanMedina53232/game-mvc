const Player = require('../models/player');

exports.saveScore = async (req, res) => {
  const { username, score } = req.body;
  try {
    let player = await Player.findOne({ username });
    if (!player) {
      player = new Player({ username, score });
    } else {
      player.score = score;
    }
    await player.save();
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
