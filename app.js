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




// cd C:\Program Files\MySQL\MySQL Server 8.0\bin                            
// mysql -h testinstance.ct7lrszoc875.us-east-1.rds.amazonaws.com -P 3306 -u admin -p  

// create table items(barcode_id int auto_increment primary key, item_name varchar(20), img_url varchar(200), department varchar(20), taxable varchar(5), unit_price double, price_unit varchar(5), case_price double , num_lb_in_case double, cases_in_stock int);    
// insert into items (item_name, img_url,department,taxable,unit_price,price_unit,case_price,num_lb_in_case,cases_in_stock) values ('','','Fruit','No',0.60,'Each', 16, 30,15);   

var db = mysql.createConnection({
 
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


var current_user;

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
	
	var checkRepeat=0;

	let p= new Promise((resolve,reject)=>{
		
		db.query("SELECT * FROM customers", function (err, result, fields) {
		    if (err) throw err;
			    result.map((element,index)=>{
		    	
				if(element.username===userN){
					checkRepeat=1;	
					console.log('first, '+checkRepeat);    
				}
			});
			if(checkRepeat===1){
				resolve(checkRepeat);
							
			}else if(checkRepeat===0){
				console.log("not repeat");
				var sql = "INSERT INTO customers (username,email,passowrd, address,phone) VALUES ('"+ userN+"','"+ email+"','"+pass+"','"+address+"','"+phone+"')";
				console.log(sql);
				db.query(sql, function (err, result) {
					if (err) throw err;
						console.log("1 record inserted");
				});
				resolve(checkRepeat);
			}
			else{
				reject('Failed');
			}
		});	
	});	
		
	p.then((message)=>{
		console.log(message);
		if(message===1){
			res.render("signup");
		}else{
			res.redirect("/");
		}
	})
		
});
app.post("/home",function(req, res){

	var userN=req.body.username;
	var pass =req.body.password;
	var checkUser=0;
	let p= new Promise((resolve,reject)=>{	
		db.query("SELECT * FROM customers", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{
					    	
				if(element.username=== userN&& element.passowrd===pass){
				   	checkUser=1;	
				   	current_user=userN;
				   	console.log(checkUser);   	    
				}
			});
			if(checkUser===1 || checkUser===0){
				resolve(checkUser);
			}
			else{
				reject('Failed');
			}
		});    
    });	
    p.then((message)=>{
		console.log(message);
		if(message===1){
			var items=[];
			let pr= new Promise((resolve,reject)=>{
				db.query("SELECT * FROM items", function (err, result, fields) {
					if (err) throw err;
					result.map((element,index)=>{  	
						items.push(element);
					});
					if(items.length>=1){
						resolve("Success");
					}else{
						reject('Failed');
					}
				
				});    
			});
			pr.then((message)=>{
				console.log(message);
				if(message==="Success"){
					res.render("home",{title:'Home Page', style: 'home.css', username:current_user, items:items});
				}else{
					res.redirect('/');
				}
			})
			
		}else{
			res.redirect("/");
		}
	});
		
});


app.get("/item/:param1", function(req, res){
	var id=parseInt(req.params.param1);
	var el;
	let p= new Promise((resolve,reject)=>{	
		db.query("SELECT * FROM items", function (err, result, fields) {
			if (err) throw err;
			result.map((element,index)=>{
				if(id==element.barcode_id){
					el=element;
					console.log(el.barcode_id);
				}
			});
			if(el){
				console.log(el);
				resolve("Success");

			}
			else{
				console.log(0);
			}
		});
	});
	p.then((message)=>{
				console.log("last"+message);
				if(message==="Success"){
					res.render("item",{username:current_user, element:el});
				}else{
					res.redirect('/');
				}
			})


	
});

app.listen(PORT,function(){
	console.log("Server is running");
});

