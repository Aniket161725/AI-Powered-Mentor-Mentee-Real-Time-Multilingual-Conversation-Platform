import Request from '../model/requestModel.js';

// ➤ Send a new request
export const sendRequest = async (req, res) => {
  try {
    const { senderId, receiverId, skill, senderlanguage , receiverlanguage } = req.body;

    // 🔒 Check if a pending request already exists
    const existing = await Request.findOne({
      senderId,
      receiverId,
      status: 'pending',
      senderlanguage,
      receiverlanguage
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already sent and pending' });
    }

    const newRequest = new Request({ senderId, receiverId, skill , senderlanguage , receiverlanguage });
    await newRequest.save();

    res.status(201).json({ message: 'Request sent', request: newRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send request' });
  }
};

// ➤ Get all requests received by a user
export const getRequestsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await Request.find({
      receiverId: userId,
      status: 'pending',  // Only fetch pending requests
    }).populate('senderId', 'name email');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// ➤ Accept or Reject a request
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (status === 'rejected') {
      await Request.findByIdAndDelete(requestId);
      return res.json({ message: 'Request rejected and deleted.' });
    }

    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    res.json({ message: `Request ${status}`, request: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request status' });
  }
};

// GET /api/requests/accepted/:userId
export const getAcceptedRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const acceptedRequests = await Request.find({
  status: "accepted",
  $or: [
    { receiverId: userId },
    { senderId: userId }
  ]
}).populate([
  { path: "senderId", select: "name" },
  { path: "receiverId", select: "name" }
]);

    res.json(acceptedRequests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accepted requests' });
  }
};
