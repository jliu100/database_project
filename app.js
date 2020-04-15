const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser= require("body-parser");
var mysql=require('mysql');

var PORT=process.env.PORT||3000;
const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static('public'));  //public folder, use for styling

var db = mysql.createConnection({

});



app.get("/", function(req, res) {
  res.render("login",{title:'LogIn Page', style:'login.css'});
});

app.get("/newUser",function(req,res){
	res.render("signup", {title:'Sign Up Page', style:'signup.css'});
});

app.post('/newAccount',function(req,res){
	var userN=req.body.username;
	var email=req.body.email;
	var pass =req.body.password;
	var address=req.body.address;
	var phone=req.body.phone;
	var arr =[];


	db.connect(function(err) {
		if (err) throw err;
		db.query("SELECT * FROM customers", function (err, result, fields) {
		    if (err) throw err;
		    
		    result.map((element,index)=>{
		    	console.log(element.username);
			   if(element.username===userN){
			   	    arr.push('repeat');		
			   }
			});
		    if(arr.length===0){
				console.log("not repeat");
				var sql = "INSERT INTO customers (username,email,passowrd, address,phone) VALUES ('"+ userN+"','"+ email+"','"+pass+"','"+address+"','"+phone+"')";
				console.log(sql);
				db.query(sql, function (err, result) {
					if (err) throw err;
						console.log("1 record inserted");
				});
			}else{
				
			}
		 });

	});
	// res.render("home",{arr:arr});


	if(checkRepeat===0){
		res.render("home");
	}
	else{
		res.render("login");
	}
	console.log(checkRepeat);
		
});

app.listen(PORT,function(){
	console.log("Server is running");
});