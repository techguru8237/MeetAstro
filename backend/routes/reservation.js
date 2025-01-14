const express = require('express');
const router = express.Router();

const Reservation = require('../models/reservation'); // Reservation model

// Create a new Reservation
router.post('/reserve', async (req, res) => {
  try {
    // Create a new reservation instance
    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();
    const reservationData = await Reservation.findById(savedReservation._id)
      .populate('client')
      .populate('items');
    res.status(201).json(reservationData);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res
      .status(500)
      .json({ message: 'Failed to create reservation', error: error.message });
  }
});

// Get all Reservations
router.get('/list', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('client')
      .populate('items');

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch reservations', error: error.message });
  }
});

// Get a list of reservations by customer
router.post('/list-by-customer', async (req, res) => {
  try {
    const id = req.body.id;

    // Fetch reservations based on customer ID
    const reservations = await Reservation.find({ client: id })
      .populate('client')
      .populate('items')
      .exec();

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch reservations', error: error.message });
  }
});

// Update a reservation
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
      }
    )
      .populate('client')
      .populate('items');

    if (!updatedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res
      .status(400)
      .json({ message: 'Failed to update reservation', error: error.message });
  }
});

// Delete a reservation
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(
      req.params.id
    );
    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(deletedReservation);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete reservation', error: error.message });
  }
});

// Get a single reservation by ID
router.get('/one/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('items');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation by ID:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch reservation', error: error.message });
  }
});

module.exports = router;
