const express = require("express");
const path = require("path");
const app = express();
// const hbs = require("hbs")
const nodemailer = require('nodemailer')
const ejs = require("ejs")
require("./db/connect")
const userModel = require('./models/student') 
const foodModel = require('./models/food')
const categoryModel = require('./models/category')
const slotModel = require("./models/slot")
const Workers = require("./models/createworker")
const cardModel = require("./models/card")
var jwt = require('jsonwebtoken');
const multer = require("multer");
const qtyModel = require("./models/checkout");
const otpModel = require('./models/otp')

const port = process.env.PORT || 5000;

const static_path = path.join(__dirname, "../public");
const temp_path = path.join(__dirname, "../templates/views");
// const part_path = path.join(__dirname, "../templates/partials");
// const part_path = path.join(__dirname, "../templates/partial");

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", temp_path)
// ejs.registerPartials(part_path);


function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination: "./public/upload/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: Storage
}).single('file');

function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModel.findOne({username:uname});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  
return res.render('signup', { title: 'Password Management System', msg:'Username Already Exit' });

 }
 next();
  });
}

function checkEmail(req,res,next){
  var email=req.body.email;
  var checkexitemail=userModel.findOne({email:email});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  
return res.render('signup', { title: 'Password Management System', msg:'Email Already Exit' });

 }
 next();
  });
}

app.post('/forget', async (req,res)=> {
  var email = req.body.email;
  var minm = 100000;
    var maxm = 999999;
  var code = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  var expiryt = new Date().getTime() + 300*1000;
  const checkUser = userModel.findOne({ email:email });
  checkUser.exec((err, data) => {
   if(data){

    var userDetails = new otpModel({
    
      email:email,
      code:code,
      expiryt:expiryt
      
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render('forget',{title:"FineDine", msg:"",succ:'OTP send in your mail',gmail:email,errors:''});
   
    });
    let transporter = nodemailer.createTransport({
      service:"gmail",
      auth : {
        user:"projectdissertation.universal@gmail.com",
        pass:"dffvlycylavsfflk"
      },
      tls:{
        rejectUnauthorized:false
      }
    })
    let mailOptions = {
      from: "projectdissertation.universal@gmail.com",
      to: email,
      subject:"OTP for resetting password",
      text:`Forget Password of FineDine is :  ${code}`
    }
  
    transporter.sendMail(mailOptions,(err,success)=>{
    if(err) {
      throw err;
    }
    else {
      console.log("successfully sent")
    }
    })
    }
    else {
      res.render("forget",{title:"FineDine", msg:"Email not exist",succ:'',errors:''})
    }
  })
  
  })  

  app.get('/forget',  (req,res)=> {
    res.render('forget',{ title: 'FineDine', msg: '',succ:'',email:'',errors:'' })
  })

  app.post('/mail', async (req,res)=> {
 
    const code = req.body.code;
  
    const checkUser = otpModel.findOne({ code:code });
    checkUser.exec((err, data) => {
     if(data) {
      const gmail= data.email;
      res.render('generate',{title:"Create New Password",msg:'',gmail:gmail})
     }
     else {
      res.render('forget',{ title: 'FineDine', msg: '',succ:'',email:'',errors:'OTP NOT MATCHED' })
    }
  })
  
  })

  app.get('/generate',(req,res)=> {
    res.render("generate",{title:"Create New Password",msg:'',gmail:''})
  })
  app.post('/generate',async (req,res)=> {
    const email = req.body.gmail;
    const password = req.body.password;
    const confpassword = req.body.confpassword;
    if(!password || !confpassword) {
      res.render("generate",{title:"Create New Password",msg:'Please fill all details',gmail:''})
    }
    else {
      if(password == confpassword){
        
        const checkUser = userModel.findOne({ email:email });
        await checkUser.exec((err,data)=>{
          if(err) throw err
          const id = data._id;
          var passdelete = userModel.findByIdAndUpdate(id, { password:password,
   confirmpassword:confpassword });
          passdelete.exec(function (err) {
            if (err) throw err;
            res.render("generate",{title:"Create New Password",msg:'Password Reset successfully',gmail:''});
          });
        })
    
   
      }
      else {
        res.render("generate",{title:"Create New Password",msg:'Password and confirm password not matched',gmail:''});
      }
    }
  })

app.get("/add-new-category", (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    res.render('addNewCategory', { title: 'FineDine', loginUser: loginUser, errors: '', success: '' });
  }
  else {
    res.redirect('/login')
  }
})



app.post("/add-new-category", upload, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const menuCategory = req.body.menuCategory;
  const image = req.file.filename;
  console.log(menuCategory)

  var passcatDetails = new categoryModel({
    menuCategory: menuCategory,
    file: image
  });

  passcatDetails.save(function (err, doc) {
    if (err) throw err;
    res.render('addNewCategory', { title: 'Restaurant Management System', loginUser: loginUser, errors: '', success: 'Product category inserted successfully' });
  })
})

app.get("/foodCategory", (req, res) => {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const getPassCat = categoryModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('foodCategory', { title: 'Restaurant Management System', loginUser: loginUser, records: data });
    })
  }
  else {
    res.redirect('/login')
  }
})



app.get("/", (req, res) =>{
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard')
  }
  else {
    res.render("index")
  }
 
});

app.get('/cart', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const getPassCat = foodModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('cart', { title: 'Restaurant Management System', loginUser: loginUser, records: data });
    })
  }
  else {
    res.redirect('/login')
  }
})

app.get('/add-cart/delete/:id', function (req, res, next) {
  var id = req.params.id;
  const productid = 123;
  var passdelete = foodModel.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/cart');
  });
});

app.get("/add-new-food", (req, res) => {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const getPassCat = categoryModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('add-new-food', { title: 'Restaurant Management System', loginUser: loginUser, records: data, success: '' });
    })
  }
  else {
    res.redirect('/login')
  }
})

app.post('/add-new-food', upload, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const pass_cat = req.body.pass_cat;
  const name = req.body.name;
  const price = req.body.price;
  const details = req.body.details;
  const pid = 999;
  const image = req.file.filename;
  console.log(pass_cat, name, price, details)
  var password_details = new foodModel({
    pass_cat: pass_cat,
    pid: pid,
    name: name,
    price: price,
    details: details,
    file: image,
  });
  console.log(pass_cat, name, price, details, pid)
  password_details.save(function (err, doc) {
    const getPassCat = categoryModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('add-new-food', { title: 'Restaurant Management System', loginUser: loginUser, records: data, success: "Product Details Inserted Successfully" });

    });

  });
});

app.post('/table', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
 
  const name = req.body.name;
  const email = req.body.email;
  const pnumber = req.body.pnumber;
  const slotf = req.body.slotf;
  // const slott = req.body.slott;
  const date = req.body.date;
  const person = req.body.person;
  const username = loginUser;
 if(!name || !email || !pnumber || !slotf || !date || !person) {
  res.render("book", { title: 'Restaurent Management System', msg:'Please fill all details',success:'' })
 }
 else {


  var password_details = new slotModel({
     name:name,
     email:email,
     pnumber:pnumber,
     slotf:slotf,
     date:date,
     person:person,
     usename:username

  });
 password_details.save(function (err, doc) {
    if (err) throw err;
    res.render("book", { title: 'Restaurent Management System', msg:'',success:'Table Booking Successfully' })
  })
}
}) 
   

app.get('/view-all-food', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {

    const getPassCat = foodModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('view-all-food', { title: 'Restaurant Management System', loginUser: loginUser, records: data });

    })
  }
});

app.get("/workerlogin", (req, res) => {
    res.render('workerlogin', { title: 'Restaurant Management System', msg: '' });
})


app.post("/workerlogin", (req, res) => {
  var username = req.body.username;
  const password = req.body.password;
  const checkUser = Workers.findOne({ username: username });
  checkUser.exec((err, data) => {
    if (data == null) {
      res.render('workerlogin', { title: 'Restaurant Management System', msg: "Invalid Username and Password." });
    } else {
      if (err) throw err;
      var getUserID = data._id;
      var getPassword = data.password;
      console.log(getPassword)
      if (password === getPassword) {
        res.redirect('/worker')
      }
      else {
        res.render('workerlogin', { title: 'Restaurant Management System', msg: "Invalid Worker Username or Password." });
      }
    }
  });
});



app.get('/create', (req, res) => {
  res.render('create', { title: 'Restaurant Management System', msg: '', succ: "" });
})
// This is the user post data 


app.post("/create", (req, res) => {
  var currentdate = new Date();
  var time = currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds();
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;
  const phonenumber = req.body.phonenumber;
  const name = req.body.name;
  const email = req.body.email;
  const username = "worker@" + time;
  if (password !== confirmpassword) {

    res.render("create", { title: 'Restaurant Management System', msg: 'Password not matched', succ: "" })
    // console.log(password,cpasswoed,phonenumber,username,email)
  }
  else {

    var userDetails = new Workers({
      name: name,
      username: username,
      email: email,
      phonenumber: phonenumber,
      password: password,
      confirmpassword: confirmpassword

    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render('create', { title: 'Restaurant Management System', msg: "", succ: "Worker Registered successfully" });
    });
  }
})

app.get('/sloting', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {

    const getPassCat = slotModel.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('sloting', { title: 'Restaurant Management System', loginUser: loginUser, records: data });

    })
  }
});

app.get('/personl',async function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const getPassCat = slotModel.find({usename:loginUser})
   await getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('personl', { title: 'Restaurant Management System', loginUser: loginUser, records: data });

    })
  }
});




app.get('/password-detail/delete/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    var id = req.params.id;
    var passdelete = foodModel.findByIdAndDelete(id);
    passdelete.exec(function (err) {
      if (err) throw err;
      res.redirect('/view-all-food');
    });
  }
});

app.get('/slot/delete/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    var id = req.params.id;
    var passdelete = slotModel.findByIdAndDelete(id);
    passdelete.exec(function (err) {
      if (err) throw err;
      res.redirect('/personl');
    });
  }
});

app.get('/slots/delete/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    var id = req.params.id;
    var passdelete = slotModel.findByIdAndDelete(id);
    passdelete.exec(function (err) {
      if (err) throw err;
      res.redirect('/sloting');
    });
  }
});


app.get("/admin", async (req, res) =>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    const cat = categoryModel.find({});
    const food = foodModel.find({});
    const slot = slotModel.find({});
    const qty = qtyModel.find({});
    try {
        let cats = await cat.exec();
        let foods = await food.exec();
        let slots = await slot.exec();
        let qtys = await qty.exec();
      res.render("admin", { title: 'Restaurent Management System', msg:'',loginUser:loginUser,cats:cats,foods:foods,slots:slots,qtys:qtys })
    }
    catch(err){
      throw Error
    }
    
  }
  else {
    res.redirect('/login')
  }

});

app.get("/about", (req, res) =>{
  res.render("about")
});

app.get("/book", (req, res) =>{
  res.render("book", { title: 'Restaurent Management System', msg:'',success:'' })
});

app.post('/checkout',(req,res)=> {
  var loginUser = localStorage.getItem('loginUser');
  const qty = req.body.qty;
  const pname = req.body.pname;
  const pprice = req.body.pprice;
  const username =loginUser;

  var qtyDetails = new qtyModel({
    qty:qty,
    pname:pname,
    pprice:pprice,
    username:username
  })
  qtyDetails.save((err,doc)=> {
    if(err) throw err;
    res.redirect('/payment')
  }) 
})

app.get('/payment',(req,res)=> {
  res.render('payment')
})

app.post("/payments", (req, res) => {
   const address = req.body.address;
   const username = req.body.username;
   const cardname = req.body.cardname;

    var userDetails = new cardModel({
      address:address,
      username:username,
      cardname:cardname
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.redirect('/invoice')
    });
})


app.get("/menu", async (req, res) =>{
  var loginUser = localStorage.getItem('loginUser');
  const item = foodModel.find({})
  const cat = categoryModel.find({})
  try {
    let items = await item.exec();
    let cats = await cat.exec();
    res.render("menu",{loginUser:loginUser,items:items,cats:cats})
  }
  catch(err){
    throw Error;
  }
  
});

app.get("/dashboard", async (req, res) =>{
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
  const item = foodModel.find({})
  const cat = categoryModel.find({})
  try {
    let items = await item.exec();
    let cats = await cat.exec();
    res.render("dashboard",{title: 'Restaurent Management System', msg:'',loginUser:loginUser,items:items,cats:cats})
  }
  catch(err){
    throw Error;
  }
}else {
  res.redirect('/')
}
});
app.get('/user',(req,res)=> {
  var loginUser = localStorage.getItem('loginUser');
  res.render('user',{title: 'Restaurent Management System', msg:'',loginUser:loginUser})
})
app.get('/add-cart/edit/:id', function (req, res, next) {

  var id = req.params.id;
  const productid = 1000;
  var passdelete = foodModel.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/menu');
  });
});

app.get("/invoice",async (req, res) =>{
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const qty = qtyModel.findOne({username:loginUser})
    const food = foodModel.find({})
    try {
      let qtys =await qty.exec()
      let foods =await food.exec()
      res.render('invoice',{loginUser:loginUser,qtys:qtys,foods:foods})
    }
    catch(err) {
      throw Error
    }
  }
  else {
    res.redirect('/login')
  }
 
});

app.get("/myorder",async (req, res) =>{
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const qty = qtyModel.findOne({username:loginUser})
    const food = foodModel.find({})
    try {
      let qtys =await qty.exec()
      let foods =await food.exec()
      res.render('myorder',{loginUser:loginUser,qtys:qtys,foods:foods})
    }
    catch(err) {
      throw Error
    }
  }
  else {
    res.redirect('/login')
  }
 
});

app.get('/worker',async (req,res)=> {
  const check = qtyModel.find({});
  try {
  let records = await check.exec();
  res.render('worker',{records:records})
  }
  catch(err){
    throw Error
  }
})

app.get("/login", (req, res) =>{
  res.render("login", { title: 'Restaurent Management System', msg:'' })
});
app.post("/login", (req, res) => {
  var username = req.body.username;
  const password = req.body.password;
  const checkUser = userModel.findOne({ username: username });
  checkUser.exec((err, data) => {
    if (data == null) {
      res.render('login', { title: 'Restaurant Management System', msg: "Invalid Username and Password." });
    }
    else {
      if (err) throw err;
      var getUserID = data._id;
      var getPassword = data.password;
      console.log(getPassword)
      if (password === getPassword) {
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', username);
        if (username == "real" && password === "1234") {
          res.redirect('/admin')
        } else {
          res.redirect('/dashboard');
        }

      }
      else {
        res.render('login', { title: 'Restaurant Management System', msg: "Invalid Username or Password." });
      }
    }
  });
});


app.get('/signup', function(req, res, next) {

    res.render('signup', { title: 'Restaurent Management System', msg:'' });
  });
  app.post('/signup',checkEmail,checkUsername,function(req, res, next) {
          var username=req.body.uname;
          var email=req.body.email;
          var pnumber = req.body.pnumber;
          var password=req.body.password;
          var confpassword=req.body.confirmpassword;
    if(password !=confpassword){
      res.render('signup', { title: 'Restaurent Management System', msg:'Password not matched!' });
     
    }else{
     
          var userDetails=new userModel({
            username:username,
            email:email,
            pnumber:pnumber,
            password:password,
            confirmpassword:confpassword
          });
       userDetails.save((err,doc)=>{
          if(err) throw err;
          res.render('signup', { title: 'Restaurent Management System', msg:'User Registerd Successfully' });
       })  ;
      } 
  });

  app.get('/menuCategory/delete/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    if (loginUser) {
      var passcat_id = req.params.id;
      var passdelete = categoryModel.findByIdAndDelete(passcat_id);
      passdelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/foodCategory');
      });
    }
    else {
      res.redirect('/login')
    }
  });

  app.get("/works", (req, res) => {
    const getPassCat = Workers.find({})
    getPassCat.exec(function (err, data) {
      if (err) throw err;
      res.render('works', { title: 'Restaurant Management System', records: data });
    })
  
    app.get('/works/delete/:id', checkLoginUser, function (req, res, next) {
      var loginUser = localStorage.getItem('loginUser');
      if (loginUser) {
        var passcat_id = req.params.id;
        var passdelete = Workers.findByIdAndDelete(passcat_id);
        passdelete.exec(function (err) {
          if (err) throw err;
          res.redirect('/works');
        });
      }
      else {
        res.redirect('/login')
      }
    });
  
  })

  app.get('/logout', function(req, res, next) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/');
  });

app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
});

