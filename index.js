const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('./models/database')
const User = require('./models/user');
const { MovieData } = require('./models/movies.js');
const {v4 : uuidv4} = require('uuid')
const { generateApiKey } = require('generate-api-key')
const userId = uuidv4();
const server_port = process.env.PORT || 5000;
const app = express();


app.use(bodyParser.json());
app.use(express.json());



app.get('/movie', Autho ,async (req, res) => {
    const allMovies = await MovieData.find();
    return res.status(200).json(allMovies);
});

app.get('/movie/:id', Autho ,async (req, res) => {
    const { id } = req.params;
    const movie = await MovieData.findById(id);
    return res.status(200).json(movie);
});

app.post("/movie", Autho ,async (req, res) => {
    const newMovie = new MovieData({ ...req.body });
    const addMovie = await newMovie.save();
    return res.status(201).json(addMovie);
});

app.post("/movie/user/register", async (req, res) => {
    const newApiKey = (generateApiKey());

    if (!req.body.username || !req.body.password) {
        res.json({ success: false, error: "Enter users name and or password" });
        return;
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      
    const newUser = new User({ username: req.body.username,
                               user_id: req.body.userId,  
                               password: hashedPassword, 
                               api_key: newApiKey });

    try {
        const savedUser = await newUser.save();
        res.json({ success: true,  
                   username: savedUser.username,
                   user_id: savedUser._id,   
                   apiKey: savedUser.api_key 
                                });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post("/movie/user/login", Autho ,async (req, res) => {

    if (!req.body.username || !req.body.password) {
        res.json({ note: api_key, success: false, error: "Enter users name and or password" });
        return;
    }

    const user = await User.findOne({ username: req.body.username});

    if (!user) {
        res.json({ success: false, error: "User does not exist" });
        return;
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, user.password, user.userId);

    if (!passwordMatch) {
        res.json({ success: false, error: "Incorrect password" });
        return;
    }

    const id = await User.findOne({userId: user.userId});

    if (!id) {
        res.json({ success: false, error: "Incorrect User name or password" });
        return;
    }

    res.json({ success: true});
});

app.put("/movie/:id", Autho ,async (req, res) => {
    const { id } = req.params;

    if (!req.body.username || !req.body.password || !req.body.userId) {
        res.json({ success: false, error: "Unknown Error" });
        return;
    }

    await MovieData.updateOne({ _id: id }, req.body);
    const updatedMovie = await MovieData.findById(id);
    return res.status(200).json(updatedMovie);
});

app.delete('/movie/:id', Autho ,async (req, res) => {
    const { id } = req.params;

    if (!req.body.username || !req.body.password || !req.body.userId) {
        res.json({ success: false, error: "Unknown Error" });
        return;
    }
    const deleteMovie = await MovieData.findByIdAndDelete(id);
    return res.status(200).json(deleteMovie);
});


async function  Autho(req, res, next){
  
    const apiKeyMatch = await User.findOne({api_key: req.headers.authorization});
    console.log(apiKeyMatch)
     if (!apiKeyMatch) {
        return res.status(401).json({ success: false, message: "User does not exist" });
        
    }
   

    next ()
    
}

app.listen(server_port, () => console.log("Server started on port " + server_port));
