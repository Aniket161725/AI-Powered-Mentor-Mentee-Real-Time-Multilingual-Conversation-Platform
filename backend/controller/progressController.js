import Progress from "../model/progressModel.js";


const getUserProgress = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    try {
        const progress = await Progress.findOne({ user: userId });
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }

        res.status(200).json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateUserProgress = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication
    const { messagesSent, messagesReceived, mentorsInteracted } = req.body;

    try {
        // Validate input
        if (messagesSent < 0 || messagesReceived < 0 || mentorsInteracted < 0) {
            return res.status(400).json({ message: 'Progress values cannot be negative' });
        }

        // Update or create progress record
        const progress = await Progress.findOneAndUpdate(
            { user: userId },
            { messagesSent, messagesReceived, mentorsInteracted },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Progress updated successfully', progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export { getUserProgress, updateUserProgress}