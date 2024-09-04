const express = require('express');
const app = express()
const {MongoClient} = require('mongodb');
const bodyParser = require("body-parser")
const cors = require("cors")
const jwt = require("jsonwebtoken")

app.use(express.json());
app.use(bodyParser.json())
app.use(cors())
 
const uri ='mongodb+srv://UnisTechnosoft:Unis12345@unis.jsif5.mongodb.net/'
const client = new MongoClient(uri);
 
const serverDb = async ()=>{
    try{
        await client.connect();
        app.listen(4000, ()=>{
            console.log("Server Runing at PORT:4000 and DB connected");
        })
    }catch(e){
        console.log(`error in intialization of server and mongodb ${e.message}`)
    }
}
 
serverDb();
 
const unisDB = client.db("UnisMilkDB")
const inventoryEntry = unisDB.collection("InventoryEntry")

const superAdmins = unisDB.collection("Super Admins Data")

app.post("/superAdmins", async (request,response) =>{
    try {
        const { userNa, pwMilk } = request.body;
        const adminData = {
            superUserName: userNa,
            superUserPassword:  pwMilk
        }
        const postData = await superAdmins.insertOne(adminData)
        response.status(201).json(postData)
        
    } catch (e) {
        console.log(`Error at post superAdmins : ${e.message}`)
    }
})

app.post("/superLoginAdmin", async (request,response) =>{
    try {
        const {user, pwUser} = request.body
        const adminsData = await superAdmins.find().toArray();
        let userCheck;
        for (let char of adminsData){
            if (char.superUserName === user && char.superUserPassword === pwUser){
                userCheck = "User Successfully loged"
            }
        }
        if (userCheck === undefined){
            response.status(400)
            response.send("U R username and password is incorrect")
        }else{
            const payload = {superUserName:user}
            const jwtToken = jwt.sign(payload,"GangaSecretToken")
            response.status(200)
            response.send({jwtToken})
        }
    } catch (e) {
        console.log(`Error at post superAdmins Login : ${e.message}`)
    }
})

const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "GangaSecretToken", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          next();
        }
      });
    }
  };

app.get('/superAdmins' , authenticateToken, async (request,response) =>{
    try {
        const adminsData = await superAdmins.find().toArray();
        response.send(adminsData)
    } catch (e) {
        console.log(`Error at GET superAdmins : ${e.message}`)
    }
})
 
app.post("/addInventories", authenticateToken, async (request,response) =>{
    try {
        const { proId, brand, proType, proVolume, proName, proImage, proDiscription, price} = request.body;
        const brandData = {
            productId:proId,
            brandName:brand,
            productType: proType,
            productVolume: proVolume,
            productName: proName,
            productImage: proImage,
            productDescription: proDiscription,
            productPrice: price
        }
        const postData = await inventoryEntry.insertOne(brandData)
        response.status(201).json(postData)
    } catch (e) {
        console.log(`Error at Brand POST Method ${e.message}`)
    }
} )
 
app.get("/addInventories", authenticateToken, async (request,response) =>{
        try {
            const brandData = await inventoryEntry.find().toArray();
            response.send(brandData)
        } catch (e) {
            console.log(`Error at Brand GET Method ${e.message}`)
        }
})

app.get("/singleInventory",authenticateToken, async (request,response) => {
    try {
        const brandData = await inventoryEntry.find({ productId: request.body.proId });
        response.send(brandData)
    } catch (e) {
        console.log(`Error at Brand GET Method ${e.message}`)
    }
})
   



app.put("/addInventories",authenticateToken, async (request,response) => {
    try {
        const { proId, brand, proType, proVolume, proName, proImage, proDiscription, price} = request.body;
        const filter = { productId: proId };
        const updateDoc = {
            $set: {
                brandName: brand,
                productType: proType,
                productVolume: proVolume,
                productName: proName,
                productImage: proImage,
                productDescription: proDiscription,
                productPrice: price
            }
        };
        await inventoryEntry.updateOne(filter, updateDoc);
        response.send("Successfully updated Brand")
    } catch (e) {
        console.log(`Error at Brand PUT Method ${e.message}`)
    }
})
 
app.delete("/addInventories",authenticateToken, async (request,response) => {
    try {
        const { proId } = request.body;
        const filter = { productId: proId };
        await inventoryEntry.deleteOne(filter);
        response.send("Successfully deleted Brand Details")
    } catch (e) {
        console.log(`Error at Brand DELETE Method ${e.message}`)
    }
})
 
 
 
 
const clientsEntry = unisDB.collection("ClientsEntry")
const clientsAddEntry = unisDB.collection("ClientsAddEntry")
 
app.post("/addClientsDetails",authenticateToken, async (request,response) =>{
    try {
        const { mobNo, type,city, name, pwd, cred, addr, aadharNo, whatsappNo,altmobNo,branch} = request.body;
        const clientsData = {
            mobileNumber: mobNo,
            userType: type,
            citY : city,
            userName: name,
            passWord:  pwd,
            creditLimit: cred
        }
        await clientsEntry.insertOne(clientsData)
        const clientsAddData = {
            mobileNumber: mobNo,
            addresS: addr,
            aadharNumber: aadharNo,
            whatsappNumber: whatsappNo,
            alternateMobileNumber: altmobNo,
            branchName: branch
        }
        await clientsAddEntry.insertOne(clientsAddData)
        response.send("Successfully added both clientsData and clientsAddData")
    } catch (e) {
        console.log(`Error at ClientsData POST Method ${e.message}`)
    }
} )
 
app.get("/addClientsDetails",authenticateToken, async (request,response) =>{
    try {
        const clientsData = await clientsEntry.find().toArray();
        const clientsAddData = await clientsAddEntry.find().toArray();
        response.send({clientsData, clientsAddData})
    } catch (e) {
        console.log(`Error at ClientsData GET Method ${e.message}`)
    }
})
 
 
 
 
 
const userclientsEntry = unisDB.collection("UserClientsEntry")
const userclientsAddEntry = unisDB.collection("UserClientsAddEntry")
app.post("/addUserClientDetails",authenticateToken, async (request,response) =>{
    try {
        const { mobNo2, type2,city2, name2, pwd2, cred2,branch2, addr2, aadharNo2, whatsappNo2,altmobNo2} = request.body;
        const userclientsData = {
            mobileNumber2: mobNo2,
            userType2: type2,
            citY2 : city2,
            userName2: name2,
            passWord2:  pwd2,
            creditLimit2: cred2,
            branchName2 : branch2
        }
        await userclientsEntry.insertOne(userclientsData)
        const userclientsAddData = {
            mobileNumber2: mobNo2,
            addresS2: addr2,
            aadharNumber2: aadharNo2,
            whatsappNumber2: whatsappNo2,
            alternateMobileNumber2: altmobNo2
       
        }
        await userclientsAddEntry.insertOne(userclientsAddData)
        response.send("Successfully added both userclientsData and userclientsAddData")
    } catch (e) {
        console.log(`Error at UserClientsData POST Method ${e.message}`)
    }
} )
 
app.get("/addUserClientDetails", authenticateToken, async (req, res) => {
    try {
        const userclientsData = await userclientsEntry.find().toArray();
        const userclientsAddData = await userclientsAddEntry.find().toArray();
        res.send({userclientsData, userclientsAddData})
    } catch (e) {
        console.log(`Error at UserClientsData GET Method ${e.message}`)
    }
})
