const mongoose= require("mongoose"); 
const initData= require("./Data.js");
const Listing=  require("../models/listing.js");
// const User = require("./user.js");
main().then(()=>{
    console.log("connection successful");

})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Shahiyatra');
}

const initDB = async ()=>{
     await Listing.deleteMany({});
     
    //  const ownerId = new mongoose.Types.ObjectId("67acc71487d69f20a9d87642");
// initData.data = initData.data.map((obj) => ({ ...obj, owner: "67acc71487d69f20a9d87642" }));


    //  initData.data=initData.data.map(( obj )=>({ ...obj, owner:"67acc71487d69f20a9d87642",}))
     console.log(initData.data)
     const loggedInUserId = new mongoose.Types.ObjectId("67acc71487d69f20a9d87642"); // Ensure ObjectId

const updatedListings = initData.data.map((listing) => ({
    ...listing,
    ownerId: loggedInUserId  // ✅ Assign the correct ownerId
}));

    
    await Listing.insertMany( updatedListings);


    console.log("data was initialized" );
};

initDB();