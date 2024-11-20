const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');

dotenv.config();

const app = express();

const port = 8000;

const cors = require('cors');
app.use(
  cors({
    origin: '*',
  }),
);
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const User = require('./models/user.js');
const Property = require('./models/property.js');

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.log('Error connecting to db', err);
  });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.json('Hello World');
});

app.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const newUser = new User(userData);
    await newUser.save();
    const secretKey = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({userId: newUser._id}, secretKey);

    res.status(200).json({token});
  } catch (error) {
    console.log('Error in registering', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message: 'Invalied Email'});
    }

    if (user.password !== password) {
      return res.status(401).json({message: 'Invalid Password'});
    }
    const secretKey = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({userId: user._id}, secretKey);
    res.status(200).json({token});
  } catch (error) {
    console.log('Error in logging in user: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/addProperty', async (req, res) => {
  try {
    const {propertyType, city, addressLane, state, country, zipCode, admin} =
      req.body;
    const newProperty = new Property({
      propertyType,
      city,
      state,
      addressLane,
      country,
      zipCode,
      admin,
    });

    const savedProperty = newProperty.save();
    res.status(200).json(savedProperty);
  } catch (error) {
    console.log('Error in adding the property: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/getProperties', async (req, res) => {
  try {
    const adminId = req.query.admin; // Expect admin ID as a query parameter

    if (!adminId) {
      return res.status(400).json({message: 'Admin ID is required.'});
    }
    const properties = await Property.find({admin: adminId});
    if (!properties || properties.length === 0) {
      return res
        .status(404)
        .json({message: 'No properties found for this user.'});
    }

    console.log('The Properties are : ', properties);
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error in getting the property: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({message: 'User Not Found'});
    }
    const simplifiedUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.selectedRole,
    };
    return res.status(200).json({user: simplifiedUser});
  } catch (error) {
    console.log('Error in getting the property: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});
