import express from 'express';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

let users = [
   
]

//all routes in here are starting with /users in the browser
router.get('/', (req, res) => {
    console.log(users);
    res.send(users);
});


router.post('/',(req,res)=>{
    const user = req.body;

    users.push({ ...user, id: uuidv4() })

    res.send(`User with the name ${user.firstName} added to the database!`)


});

router.get('/:id',(req, res) =>{
    const { id } = req.params;

    const foundUser = users.find((user) => user.id === id);

    res.send(foundUser);
});

router.delete('/:id',(req,res) => {
    const { id } = req.params;

    users = users.filter((user)=> user.id != id);

    res.send(`USers with the id ${id} is now deleted from the data base`)
})

export default router;