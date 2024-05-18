const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');  // Require the 'fs' module to read files
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.text({ type: 'text/html' }));
app.use(express.json());
const addData = require('./Functions/insertFunctions');
const verifyData = require('./Functions/verifyFunction');
const deleteData = require('./Functions/deletefunctions');
const getData = require('./Functions/getFunctions');
const updateData = require('./Functions/updateFunctions');
// const { emailservice } = require('./services/emailservice');
const { UpdatePasswordmailservice } = require('./services/emailservice');
const { sendInvoice } = require('./services/emailservice');
const { generateQR } = require('./services/QrGeneration');
const multer = require('multer');
const userdbInstance = require('./instances/dbInstance');
// var upload = multer({ dest: './uploads/' });


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        console.log("print helo Inside : ");
        // const imageName = req.body.imageName;
        console.log("Inner : ", req.body);
        cb(null, 'PassbookImg' + 'userid' + path.extname(file.originalname)); // Set unique filename
    },
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));


app.post('/verify/:entity(user|credentials)', async (req, res) => {
    const entity = req.params.entity;
    if (entity === 'credentials') {
        let result = await verifyData.checkCredentials(req, res);
    }
    else {
        res.status(400).send('Invalid elements value');
    }

});

// add into DB
app.post('/add/:entity(user|products|invoice|feedback|ProformaInvoice)', upload.single('image'), async (req, res) => {
    const entity = req.params.entity;
    if (entity === 'user') {
        try {
            // const passbookImg  = req.body.SignatureImage;
            // console.log(passbookImg);
            // res.json({ message: "Testing-1" });
            console.log("image is ");
            console.log(req.body.image);
            const addUser = await addData.addUser(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'products') {
        try {
            const addUser = await addData.addProduct(req, res);
        } catch (error) {
            console.error('Error Adding products details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'feedback') {
        try {
            const addUser = await addData.addfeedback(req, res);
        } catch (error) {
            console.error('Error Adding feedback details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'invoice') {
        try {
            console.log("invoice request");
            console.log(req.body);
            const addUser = await addData.addInvoice(req, res);
        } catch (error) {
            console.error('Error retrieving products details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'ProformaInvoice') {
        try {
            console.log("proforma invoice request");
            console.log(req);
            const addUser = await addData.ProformaInvoice(req, res);

        } catch (error) {
            console.error('Error retrieving products details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
})
app.use('/images', express.static(path.join(__dirname, 'uploads')));
// Get Data From DB
app.post('/get/:entity(user|credentials|product|products|state|district|access_control|transactionHistory|productList|getUserList|profileInfo|SenderDataInvoiceAddress|ReciverDataInvoiceAddress|signature|getSignExistance)', async (req, res) => {
    const entity = req.params.entity;
    const requestData = req.body;
    if (entity === 'user') {
        try {
            var userdata = await getData.getUserData(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'state') {
        try {
            var userdata = await getData.getStateData(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'district') {
        try {
            var userdata = await getData.getDistrictData(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'getSignExistance') {
        try {
            var userdata = await getData.getSignExistance(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'SenderDataInvoiceAddress') {
        try {
            var userdata = await getData.SenderDataInvoiceAddress(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'signature') {
        try {
            const { userid } = req.body;

            const CheckForStaff = await userdbInstance.userdb.query(`select positionid from public."user" where userid=$1;`, [userid]);
            console.log(CheckForStaff.rows[0].positionid);
            const res_positionId = CheckForStaff.rows[0].positionid
            let belongsto;
            if (res_positionId == 4 || res_positionId == 5) {
                const getBelongsto = await userdbInstance.userdb.query(`select adminid from public."user" where userid=$1;`, [userid]);
                belongsto = getBelongsto.rows[0].adminid
            } else {
                belongsto = userid
            }

            console.log("belongsto nithi verify - : ", belongsto);
            const folderPath = '../uploads'; // Change this to the path of your folder
            const fileName = belongsto;
            const filePath = path.join(folderPath, fileName);


            const allowedExtensions = ['jpeg', 'jpg', 'png'];


            res.send({ src: `images/${fileName}.png` });


            // // Find the first matching extension from the allowed list
            // const matchedExtension = allowedExtensions.find(ext => {
            //     const imagePath = `images/${userid}.${ext}`;
            //     // Check if the file exists
            //     return fs.existsSync(imagePath);
            // });
            // if (matchedExtension) {
            //     res.send({ src: `images/${userid}.${matchedExtension}` });
            // } else {
            //     res.status(404).send({ error: 'Image not found' });
            // }

            // res.sendFile(path.join(__dirname, 'uploads', `${userid}.jpeg`));
            // var userdata = await getData.GetSignature(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'ReciverDataInvoiceAddress') {
        try {
            var userdata = await getData.ReciverDataInvoiceAddress(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'profileInfo') {
        try {
            var userdata = await getData.getprofileInfo(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'product') {
        var userdata = await getData.getProductDataIndividual(req, res);
    }
    if (entity === 'products') {
        try {
            var userdata = await getData.getProducts(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'transactionHistory') {
        try {
            var userdata = await getData.getTransactionHistory(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'productList') {
        try {
            var userdata = await getData.getProductList(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    if (entity === 'getUserList') {
        try {
            var userdata = await getData.getUserList(req, res);
        }
        catch (error) {
            res.send("error");
            console.error("Error retrieving data");
        }
    }
    // else {
    //     res.status(400).send('Invalid elements value');
    // }
});

app.get('/get/:entity(user|product)/:id', async (req, res) => {
    const entity = req.params.entity;
    const { id } = req.params;
    if (entity === 'user') {
        var userdata = await getData.getUserDataIndividual(req, res);
    }
    // else if (entity === 'product') {
    //     var userdata = await getData.getProductDataIndividual(req, res);
    // }
    else {
        res.status(400).send('Invalid elements value');
    }
})



// Update Data from DB
app.put('/update/:entity(user|product|productremove|userremove|password|productQuantity|reciverStatus|senderStatus)', async (req, res) => {
    const entity = req.params.entity;
    if (entity === 'user') {
        var userdata = await updateData.updateUserDataIndividual(req, res);
    }
    else if (entity === 'product') {
        var userdata = await updateData.updateProductDataIndividual(req, res);
    }
    else if (entity === 'productremove') {
        var userdata = await updateData.updateProducts(req, res);
    }
    else if (entity === 'productQuantity') {
        var userdata = await updateData.productQuantity(req, res);
    }
    else if (entity === 'userremove') {
        var userdata = await updateData.updateStatusToRemove(req, res);
    }
    else if (entity === 'password') {
        var userdata = await updateData.updateUserPassword(req, res);
    }
    else if (entity === 'reciverStatus') {
        var userdata = await updateData.updatereciverStatus(req, res);
    }
    else if (entity === 'senderStatus') {
        var userdata = await updateData.updatesenderStatus(req, res);
    }
});

// user profile update url controlling 
app.put('/profile_udpate/:entity(user)', async (req, res) => {
    const entity = req.params.entity;

    if (entity === "user") {
        const result_data = await updateData.update_user_profile(req, res);

    }
    console.log("profile updation request data");
    console.log(entity);


});
// Delete data
app.post('/delete/:entity(user|products)', async (req, res) => {
    const entity = req.params.entity;
    if (entity === 'user') {
        try {
            const deleteUser = await deleteData.deleteUser(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'products') {
        try {
            const deleteUser = await deleteData.deleteInvoice(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
})

app.post('/send-email/:entity(updatePassword|generateQR|sendInvoice)', async (req, res) => {
    // emailservice
    const entity = req.params.entity;
    if (entity === 'updatePassword') {
        try {
            const deleteUser = await UpdatePasswordmailservice(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'generateQR') {
        try {
            const generateQRResult = await generateQR(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    if (entity === 'sendInvoice') {
        try {
            // const htmlString = req.body;
            // console.log("test1");
            const generateQRResult = await sendInvoice(req, res);
        } catch (error) {
            console.error('Error retrieving user details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

// Example route to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const { imageName } = req.body;
    // console.log("outer : ",imageName);
    // console.log("okkk api");
    const currentUser = imageName;
    const SignName = `${imageName}.png`;
    // console.log(currentUser ," ",SignName);
    fs.rename(file.path, './uploads/' + (imageName + path.extname(file.originalname)), async function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error renaming file' });
        }
        try {
            const userupdateResult = await userdbInstance.userdb.query(`UPDATE public."user" SET signature =$1 where userid=$2;`, [SignName, currentUser]);
            // if (userupdateResult.rowCount === 1) {
            //     res.json({ success: true, message: `Signature Updated Successfully`, filename: imageName });
            // } else {
            //     // If no rows were affected by the update (likely due to incorrect currentUser)
            //     res.status(404).json({ success: false, message: 'User not found or signature not updated' });
            // }
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Error querying user database' });
        }
        res.json({ status: true, message: `Signature Updated Successfully`, filename: imageName });
    });
});

//Mathan - email

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // or 465
    secure: false,
    auth: {
        user: 'terionorganization@gmail.com',
        pass: 'imkq rydg xtla lvmx'
    }
});

const invoicesDir = path.join(__dirname, 'EmailPdfContent');

// Ensure the invoices directory exists
if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
}
console.log(invoicesDir);

// Define a route to handle saving PDF files
app.post('/save-pdf-server', upload.single('file'), async (req, res) => {
    // Check if file exists in the request
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const tempPath = req.file.path;
    const targetPath = path.join(invoicesDir, 'Email.pdf');
    const recivermail = await userdbInstance.userdb.query('select email from public."user" where organizationname=$1', [req.body.companyname]);
    console.log("email to : ", recivermail.rows[0].email);
    const to = recivermail.rows[0].email;
    console.log(to);
    fs.rename(tempPath, targetPath, err => {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ message: 'Error saving file' });
        } else {
            // Read the PDF file
            fs.readFile(targetPath, (err, data) => {
                if (err) {
                    console.error('Error reading PDF file:', err);
                    return res.status(500).send('Error reading PDF file');
                }

                // Mail options
                const mailOptions = {
                    from: 'terionorganization@gmail.com',
                    to: to,
                    subject: 'Official mail from Terion Organization',
                    text: 'INVOICE FROM TERION',
                    attachments: [
                        {
                            filename: 'Email.pdf',
                            content: data
                        }
                    ]
                };

                // Send mail
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        return res.status(500).send('Error sending email');
                    }
                    console.log('Email sent: ' + info.response);

                    // After email is sent successfully, delete the PDF file
                    fs.unlink(targetPath, err => {
                        if (err) {
                            console.error('Error deleting PDF file:', err);
                        } else {
                            console.log('PDF file deleted successfully');
                        }
                    });

                    res.send({ status: true, message: 'Email sent successfully' });
                });
            });
        }
    });
});


// get invoice data 
app.post('/getinvoice_data',async(req,res)=>{
    console.log("invoice id is:\t"+req.body.invoiceId);
    try {
        const invoice_data = await getData.getInvoiceData(req,res);

    } catch (error) {
        console.error('Error Invoice Generation Page:', error);
        res.status(500).send('Invoice Generation Server  Error');
    }
});


// get product list
app.post('/getproduct_data',async(req,res)=>{
    // res.json({mesg:"heelo"});
    try{
        const product_data = await getData.getproduct_data(req,res);
    }
    catch(error){
        res.status(500).send("Transaction details page product data getting error");

    }
});

// customer order submition
app.post('/Customer/order',async(req,res)=>{
    try {
        console.log("server data in customer order data");
        console.log(req.body);
        const result = await addData.insertCustomerOrder(req,res);
    } catch (error) {
        res.status(5000).send("Customer order submission in");
    }
});


// get order data in order management module
app.post('/getOrderData',async(req,res)=>{
    try {
        console.log("order management module req data is");
        console.log(req.body);
        const result = await getData.getOrder_Management_Data(req,res);
    } catch (error) {
        res.status(5000).send("Order Management data getting server side issue");
    }
});

// order submition in order managment module
app.post('/Order_submition',async(req,res)=>{
    console.log("server data ");
    if((req.body.payment_status==='payment_failure') && (req.body.order_data.transaction_id===null || req.body.order_data.transaction_id==='')){
        console.log("only for ordermanagement table");
        const product_order_submit = await updateData.order_cancel_product(req,res);
    }else if((req.body.payment_status==='online_payment') && (req.body.order_data.transaction_id!=null || req.body.order_data.transaction_id!='') ){
        console.log("invoice table and order management table insertion");
        const product_order_submit = await updateData.Order_submition(req,res);
    }
    
});

// order management if i click pencil button it get order item data
app.post('/get_order_item',async(req,res)=>{
    try {
        console.log("order item request records");
        console.log(req.body);
        const order_item_data = await getData.getOrder_Item(req,res);
        
    } catch (error) {
        res.status(6000).json({message:"Kindly check the api handling its error root cause"});
    }
   
    
});

app.listen(4000, () => {
    console.log("server is running on port 4000");
});

