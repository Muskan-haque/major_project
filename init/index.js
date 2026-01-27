const mongoose = require("mongoose");
const initData=  require("./data.js");
const Listing =  require("../models/listing.js");

main().then(()=>{
    console.log("connection successfull");
}).catch((err)=>{
    console.log(err);
})
async function main () {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust")
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:"68f69b481565a7d7066fcb3a",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was saved");

}

initDB();