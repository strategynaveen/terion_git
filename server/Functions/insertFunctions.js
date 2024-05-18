const userdbInstance = require('../instances/dbInstance');
const { UserAddedMail } = require('../services/emailservice');

const format = require('pg-format');

async function addUser(req, res) {
    const {
        userid,
        OrganizationName,
        bussinessType,
        gstNumber,
        panNumber,
        aadharNo,
        fName,
        lName,
        Positionid,
        email,
        mobileNo,
        adminid,
        upiPaymentNo,
        accName,
        accHolderName,
        accNo,
        ifscCode,
        passbookImg,

        pAddress,
        streetAddress,
        City,
        State,
        pCode,

        CommunicationAddress,
        StreetAddress2,
        City2,
        State2,
        PostalCode2 } = req.body.userDetials;
    const status = 1;
    const AccessControls = req.body.AccessControls;
    const Currentuser = req.body.Currentuser;
    console.log("Currentuser", Currentuser);

    // const file = req.file;
    // console.log(file);
    // res.json({ message: "Testing-3" ,status:true});

    try {
        const CheckForStaff = await userdbInstance.userdb.query(`select positionid from public."user" where userid=$1;`, [adminid]);
        console.log(CheckForStaff.rows[0].positionid);
        const res_positionId = CheckForStaff.rows[0].positionid
        let belongsto;
        if (res_positionId == 4 || res_positionId == 5) {
            const getBelongsto = await userdbInstance.userdb.query(`select adminid from public."user" where userid=$1;`, [adminid]);
            belongsto = getBelongsto.rows[0].adminid
        } else {
            belongsto = adminid
        }

        await userdbInstance.userdb.query('BEGIN');
        // const ueserTable_old = await userdbInstance.userdb.query('INSERT INTO public."user" (userid,email, phno, altphoneno, aadhar, pan, name, positionid, adminid, pstreetname, pdistrictid, pstateid, ppostalcode,status) VALUES($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING userid',
        //     [userid, email, mobileNo, mobileNo, aadharNo, panNumber, fName, Positionid, adminid, streetAddress, City, State, pCode, status]);
        const ueserTable = await userdbInstance.userdb.query('INSERT INTO public."user" (userid,email, phno, aadhar, pan, positionid, adminid,status, pstreetname, pdistrictid, pstateid, ppostalcode , cstreetname, cdistrictid,cstateid, cpostalcode,organizationname, gstnno, bussinesstype, fname, lname, upiid,bankname, bankaccno,passbookimg,accholdername,ifsccode,updatedby) VALUES($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) RETURNING userid',
            [userid, email, mobileNo, aadharNo, panNumber, Positionid, belongsto, status, streetAddress, City, State, pCode, StreetAddress2, City2, State2, PostalCode2, OrganizationName, gstNumber, bussinessType, fName, lName, upiPaymentNo, accName, accNo, passbookImg, accHolderName, ifscCode, Currentuser]);

        // // console.log(ueserTable.rows[0].userid);
        // // const userid = ueserTable.rows[0].userid
        const credentialTable = await userdbInstance.userdb.query('INSERT INTO credentials (userid,username,lastupdatedby) VALUES ($1,$2,$3)',
            [userid, email, Currentuser]);

        // Staff Controls
        if (AccessControls['Staff'] === 'No access') {
            staff_ac = 0;
        } else if (AccessControls['Staff'] === 'View') {
            staff_ac = 1;
        }
        else if (AccessControls['Staff'] === 'Edit') {
            staff_ac = 2;
        }
        else if (AccessControls['Staff'] === 'All') {
            staff_ac = 3;
        }
        // Distributor Controls
        if (AccessControls['D_Staff'] === 'No access') {
            D_Staff_ac = 0;
        } else if (AccessControls['D_Staff'] === 'View') {
            D_Staff_ac = 1;
        }
        else if (AccessControls['D_Staff'] === 'Edit') {
            D_Staff_ac = 2;
        }
        else if (AccessControls['D_Staff'] === 'All') {
            D_Staff_ac = 3;
        }
        // D_staff Controls
        if (AccessControls['Distributor'] === 'No access') {
            distributor_ac = 0;
        } else if (AccessControls['Distributor'] === 'View') {
            distributor_ac = 1;
        }
        else if (AccessControls['Distributor'] === 'Edit') {
            distributor_ac = 2;
        }
        else if (AccessControls['Distributor'] === 'All') {
            distributor_ac = 3;
        }
        // Customer Controls
        if (AccessControls['Customer'] === 'No access') {
            customer_ac = 0;
        } else if (AccessControls['Customer'] === 'View') {
            customer_ac = 1;
        }
        else if (AccessControls['Customer'] === 'Edit') {
            customer_ac = 2;
        }
        else if (AccessControls['Customer'] === 'All') {
            customer_ac = 3;
        }
        // Products Controls
        if (AccessControls['Products'] === 'No access') {
            products_ac = 0;
        } else if (AccessControls['Products'] === 'View') {
            products_ac = 1;
        }
        else if (AccessControls['Products'] === 'Edit') {
            products_ac = 2;
        }
        else if (AccessControls['Products'] === 'All') {
            products_ac = 3;
        }
        // Invoice Generator Controls
        if (AccessControls['Invoice Generator'] === 'No access') {
            InvoiceGenerator_ac = 0;
        } else if (AccessControls['Invoice Generator'] === 'View') {
            InvoiceGenerator_ac = 1;
        }
        else if (AccessControls['Invoice Generator'] === 'Edit') {
            InvoiceGenerator_ac = 2;
        }
        else if (AccessControls['Invoice Generator'] === 'All') {
            InvoiceGenerator_ac = 3;
        }
        // Invoice PaySlip Controls
        if (AccessControls['Invoice PaySlip'] === 'No access') {
            InvoicePaySlip_ac = 0;
        } else if (AccessControls['Invoice PaySlip'] === 'View') {
            InvoicePaySlip_ac = 1;
        }
        else if (AccessControls['Invoice PaySlip'] === 'Edit') {
            InvoicePaySlip_ac = 2;
        }
        else if (AccessControls['Invoice PaySlip'] === 'All') {
            InvoicePaySlip_ac = 3;
        }
        // console.log('test : ',staff_ac,Distributor_ac,Customer_ac,Products_ac,InvoiceGenerator_ac,InvoicePaySlip_ac);
        const access_controlTable = await userdbInstance.userdb.query('insert into accesscontroll (distributer,product,invoicegenerator,userid,customer,staff,invoicepayslip,d_staff,last_updated_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
            [distributor_ac, products_ac, InvoiceGenerator_ac, userid, customer_ac, staff_ac, InvoicePaySlip_ac, D_Staff_ac, Currentuser]);
        await userdbInstance.userdb.query('COMMIT');
        // const Res_UserAddedMail = UserAddedMail(req, res);
        return res.json({ message: "Data inserted Successfully", status: true });
    } catch (error) {
        await userdbInstance.userdb.query('ROLLBACK');
        console.error('Error executing database query:', error);
        // throw error; 
        if (error.message.includes('unique constraint')) {
            // Assuming a unique constraint violation indicates a duplicate entry
            return res.json({ message: "User Already Exist", status: false });
        } else {
            // For other errors, you might return a generic message or the error details
            return 'Failed to add user: ' + error.message;
        }
    }
}
async function addInvoice(req, res) {

    // const { UserId, senderID, Date } = req.body.invoice;
    const { Buyer, senderID, Date } = req.body.invoice;
    const totalSum = req.body.totalValues;
    console.log("invoice database side data passing");
    console.log(req.body);
    // const recivermail = UserId;
    const invoiceItem = req.body.invoiceitem;
    
    console.log(Buyer, senderID, Date);
    console.log(totalSum);
    // console.log("senderID", senderID);
    // console.log(invoiceItem);
    const Currentuser = senderID;
    // res.send("hai");
    try {
        const getReciverId = await userdbInstance.userdb.query('select email,userid from public."user" where organizationname=$1;', [Buyer]);
        const recivermail = getReciverId.rows[0].email;
        const reciveruserid = getReciverId.rows[0].userid;
        console.log("recivermail : ",recivermail);
        console.log("reciveruserid : ",reciveruserid);

        const CheckForStaff = await userdbInstance.userdb.query(`select positionid from public."user" where userid=$1;`, [senderID]);
        // console.log(CheckForStaff.rows[0].positionid);
        const res_positionId = CheckForStaff.rows[0].positionid
        console.log("TEst Id position", res_positionId);
        let belongsto;
        if (res_positionId == 4 || res_positionId == 5) {
            const getBelongsto = await userdbInstance.userdb.query(`select adminid from public."user" where userid=$1;`, [senderID]);
            belongsto = getBelongsto.rows[0].adminid
        } else {
            belongsto = senderID
        }
        console.log("belongsto- senderid : ", belongsto);

        const checkIsUsernameExist = await userdbInstance.userdb.query('select email from public."user" where email=$1 and adminid=$2;', [recivermail, belongsto]);
        console.log("Check for row exists : ", checkIsUsernameExist.rows);
        if (checkIsUsernameExist.rows != 0) {
            await userdbInstance.userdb.query('BEGIN');

            const ForReciverId = await userdbInstance.userdb.query(
                `select userid from public."user" where email=$1`, [recivermail]
            );

            const reciverID = ForReciverId.rows[0].userid
            console.log("RECIVERID", reciverID);
            const InvoiceTableResult = await userdbInstance.userdb.query(
                `INSERT INTO public.invoice(
                    senderid,receiverid,senderstatus,date,total,lastupdatedby)
                VALUES ($1,$2,$3,$4,$5,$6) RETURNING invoiceid;`, [belongsto, reciverID, 0, Date, totalSum,Currentuser]
            );
            // console.log(InvoiceTableResult.rows[0].invoiceid);
            const invoiceid = InvoiceTableResult.rows[0].invoiceid;
            console.log(invoiceid);
            for (const item of invoiceItem) {
                // console.log(item.id);
                // console.log(item.hsncode, " : next : " ,item.batchno );
                // const for_productid = await userdbInstance.userdb.query(
                //     `select productid from public.products WHERE belongsto=$1 and productname=$2`, [senderID, item.productName]
                // );
                // // console.log(for_productid.rows[0].productid);
                // const productIdByName = for_productid.rows[0].productid

                // if (productIdByName) {
                //     item.productid = productIdByName
                // }
                const ReduceFromSenderTable = await userdbInstance.userdb.query(
                    `UPDATE products
                    SET quantity = quantity - $1
                    WHERE belongsto=$2 and productid = $3 and batchno = $4;`, [item.Quantity, belongsto, item.hsncode, item.batchno]
                );

                const checkProductAlreadyExist = await userdbInstance.userdb.query(
                    `select productid from public.products WHERE belongsto=$1 and productid=$2 and batchno = $3`, [reciverID, item.hsncode, item.batchno]
                );
                console.log(checkProductAlreadyExist.rows);
                if (checkProductAlreadyExist.rows.length > 0) {
                    // console.log("Yes");
                    const UpdateToRecieverTable = await userdbInstance.userdb.query(
                        `Update public.products SET quantity=quantity+$1 WHERE belongsto=$2 AND productid=$3 AND batchno = $4;`, [item.Quantity, reciverID, item.hsncode, item.batchno]
                    );
                } else {
                    // console.log("No");
                    const getAllOtherDetails = await userdbInstance.userdb.query(
                        `select priceperitem ,cgst , sgst from public.products WHERE belongsto=$1 and productid=$2 and batchno = $3`, [belongsto, item.hsncode, item.batchno]
                    );
                    console.log("Identification", getAllOtherDetails.rows[0]);
                    const priceperitem = getAllOtherDetails.rows[0].priceperitem;

                    const cgst = getAllOtherDetails.rows[0].cgst;
                    const sgst = getAllOtherDetails.rows[0].sgst;
                    // console.log("priceperitem : ",priceperitem , cgst,sgst);
                    const AddToRecieverTable = await userdbInstance.userdb.query(
                        `INSERT INTO public.products(
                            productid, quantity,productname,belongsto, status , batchno , priceperitem , cgst , sgst,last_updated_by)
                            VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10);`, [item.hsncode, item.Quantity, item.productName, reciverID, 0, item.batchno, priceperitem, cgst, sgst,Currentuser]
                    );
                }

                const product_data = await userdbInstance.userdb.query(`select priceperitem,cgst,sgst from public.products where productid=$1 and belongsto=$2 and  batchno = $3`,[item.hsncode,belongsto,item.batchno]);
                const priceperitem = product_data.rows[0].priceperitem;
                const cgst = product_data.rows[0].cgst;
                const sgst = product_data.rows[0].sgst;
                console.log("before invoice item insertion");
                console.log(priceperitem);
                console.log(product_data);
                const InvoiceItemTableResult = await userdbInstance.userdb.query(
                    `INSERT INTO public.invoiceitem(
                    invoiceid,productid,quantity,discountperitem,cost,batchno,priceperitem, cgst, sgst)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`, [invoiceid, item.hsncode, item.Quantity, item.Discount, item.Total,item.batchno,priceperitem,cgst,sgst]
                );
            }
            await userdbInstance.userdb.query('COMMIT');
            return res.json({ message: "Successfully Invoice Generated", status: true, invoiceid: invoiceid });
        } else {
            console.log("User ID doesn't exist");
            res.json({ message: "User ID doesn't exist" });
        }
    } catch (error) {
        console.error('Error executing database query:', error);
        return res.json({ message: 'Failed to add Invoice', status: false, error: error.message });
    }
}
async function ProformaInvoice(req, res) {

    // const { UserId, senderID, Date } = req.body.invoice;
    const { Buyer, senderID, Date } = req.body.invoice;
    const totalSum = req.body.totalValues;
    console.log(Buyer, senderID, Date);
    const invoiceItem = req.body.invoiceitem;
    console.log("invoiceItem : ",invoiceItem);
    // console.log("senderID", senderID);
    const Currentuser = senderID;
    // return res.json({ message: "Successfully Proforma-Invoice Generated", status: true, invoiceid: "invoiceid" });
    try {
        const getReciverId = await userdbInstance.userdb.query('select email from public."user" where organizationname=$1;', [Buyer]);
        const recivermail = getReciverId.rows[0].email;
        const CheckForStaff = await userdbInstance.userdb.query(`select positionid from public."user" where userid=$1;`, [senderID]);
        // console.log(CheckForStaff.rows[0].positionid);
        const res_positionId = CheckForStaff.rows[0].positionid
        // console.log("TEst Id position", res_positionId);
        let belongsto;
        if (res_positionId == 4 || res_positionId == 5) {
            const getBelongsto = await userdbInstance.userdb.query(`select adminid from public."user" where userid=$1;`, [senderID]);
            belongsto = getBelongsto.rows[0].adminid
        } else {
            belongsto = senderID
        }
        // console.log("belongsto- senderid : ", belongsto);

        const checkIsUsernameExist = await userdbInstance.userdb.query('select email from public."user" where email=$1 and adminid=$2;', [recivermail, belongsto]);
        console.log("Check for row exists : ", checkIsUsernameExist.rows);
        if (checkIsUsernameExist.rows != 0) {
            await userdbInstance.userdb.query('BEGIN');

            const ForReciverId = await userdbInstance.userdb.query(
                `select userid from public."user" where email=$1`, [recivermail]
            );

            const reciverID = ForReciverId.rows[0].userid
            console.log("RECIVERID", reciverID);
            const InvoiceTableResult = await userdbInstance.userdb.query(
                `INSERT INTO public.proformainvoice(
                    senderid,receiverid,senderstatus,date,total,lastupdatedby)
                VALUES ($1,$2,$3,$4,$5,$6) RETURNING invoiceid;`, [belongsto, reciverID, 0, Date, totalSum,Currentuser]
            );
            // console.log(InvoiceTableResult.rows[0].invoiceid);
            const invoiceid = InvoiceTableResult.rows[0].invoiceid;
            // console.log(invoiceid);
            for (const item of invoiceItem) {
                // const ReduceFromSenderTable = await userdbInstance.userdb.query(
                //     `UPDATE products
                //     SET quantity = quantity - $1
                //     WHERE belongsto=$2 and productid = $3 and batchno = $4;`, [item.Quantity, belongsto, item.hsncode, item.batchno]
                // );

                // const checkProductAlreadyExist = await userdbInstance.userdb.query(
                //     `select productid from public.products WHERE belongsto=$1 and productid=$2 and batchno = $3`, [reciverID, item.hsncode, item.batchno]
                // );
                // console.log(checkProductAlreadyExist.rows);

                // if (checkProductAlreadyExist.rows.length > 0) {
                //     // console.log("Yes");
                //     const UpdateToRecieverTable = await userdbInstance.userdb.query(
                //         `Update public.products SET quantity=quantity+$1 WHERE belongsto=$2 AND productid=$3 AND batchno = $4;`, [item.Quantity, reciverID, item.hsncode, item.batchno]
                //     );
                // }
                //  else {
                //     // console.log("No");
                //     const getAllOtherDetails = await userdbInstance.userdb.query(
                //         `select priceperitem ,cgst , sgst from public.products WHERE belongsto=$1 and productid=$2 and batchno = $3`, [belongsto, item.hsncode, item.batchno]
                //     );
                //     console.log("Identification", getAllOtherDetails.rows[0]);
                //     const priceperitem = getAllOtherDetails.rows[0].priceperitem;

                //     const cgst = getAllOtherDetails.rows[0].cgst;
                //     const sgst = getAllOtherDetails.rows[0].sgst;
                //     // console.log("priceperitem : ",priceperitem , cgst,sgst);
                //     const AddToRecieverTable = await userdbInstance.userdb.query(
                //         `INSERT INTO public.products(
                //             productid, quantity,productname,belongsto, status , batchno , priceperitem , cgst , sgst,last_updated_by)
                //             VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10);`, [item.hsncode, item.Quantity, item.productName, reciverID, 0, item.batchno, priceperitem, cgst, sgst,Currentuser]
                //     );
                // }

                const prodcut_data_invoice = await userdbInstance.userdb.query(`SELECT priceperitem,batchno,cgst,sgst  FROM public.products where productid=$1 `,[item.hsncode]);
                let priceperitem = prodcut_data_invoice.rows[0].priceperitem;
                let batchno = prodcut_data_invoice.rows[0].batchno;
                let cgst = prodcut_data_invoice.rows[0].cgst;
                let sgst = prodcut_data_invoice.rows[0].sgst;

                const InvoiceItemTableResult = await userdbInstance.userdb.query(
                    `INSERT INTO public.proformainvoiceitem(
                    invoiceid,productid,quantity,discountperitem,cost,hsncode,lastupdatedby,batchno,priceperitem, cgst, sgst)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`, [invoiceid, item.hsncode, item.Quantity, item.Discount, item.Total,item.hsncode,Currentuser,batchno,priceperitem,cgst,sgst]
                );
            }
            await userdbInstance.userdb.query('COMMIT');
            return res.json({ message: "Successfully Proforma-Invoice Generated", status: true, invoiceid: invoiceid });
        } else {
            console.log("User ID doesn't exist");
            res.json({ message: "User ID doesn't exist" });
        }
    } catch (error) {
        console.error('Error executing database query:', error);
        return res.json({ message: 'Failed to add Invoice', status: false, error: error.message });
    }
}

async function addProduct(req, res) {
    // const { hsncode,quantity,priceperitem,userid } = req.body;
    const { hsncode, productname, quantity, priceperitem, batchno, CGST, SGCT } = req.body.productdetial;
    const { updator } = req.body;
    console.log(hsncode, quantity, priceperitem, productname, updator);



    try {
        const CheckForStaff = await userdbInstance.userdb.query(`select positionid from public."user" where userid=$1;`, [updator]);
        console.log(CheckForStaff.rows[0].positionid);
        const res_positionId = CheckForStaff.rows[0].positionid
        let belongsto;
        if (res_positionId == 4 || res_positionId == 5) {
            const getBelongsto = await userdbInstance.userdb.query(`select adminid from public."user" where userid=$1;`, [updator]);
            belongsto = getBelongsto.rows[0].adminid
        } else {
            belongsto = updator
        }
        // console.log(belongsto);
        
        const CheckForProductExistance = await userdbInstance.userdb.query(`select * from products where productid=$1 and batchno=$2 and belongsto=$3;`, [hsncode, batchno, belongsto]);
        console.log(CheckForProductExistance.rows.length);
        if (CheckForProductExistance.rows.length > 0) {
            res.json({ message: "Product Already Exist!", status: false })
        }
        else {
            await userdbInstance.userdb.query('BEGIN');
            const insertProductResult = await userdbInstance.userdb.query(`INSERT INTO public.products(
                productid, quantity, priceperitem, last_updated_by,productname,belongsto,status,batchno,cgst,sgst)
                VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10);`, [hsncode, quantity, priceperitem, updator, productname, belongsto, '1', batchno, CGST, SGCT]);
            await userdbInstance.userdb.query('COMMIT');
            if (insertProductResult.rowCount === 1) {
                res.json({ message: "Data inserted Successfully", status: true });
            } else {
                res.status(404).json({ message: "User not found", status: false });
            }
        }

    } catch (error) {
        console.error('Error executing database query:', error);
        if (error.code === '23505') {
            res.json({ message: "Unique constraint violation: Duplicate entry", status: false });
        } else {
            res.status(500).json({ message: "Internal Server Error", status: false });
        }
    }
}

async function addfeedback(req, res) {
    // const { hsncode,quantity,priceperitem,userid } = req.body;
    const feedback = req.body.feedback;
    const currentuserId = req.body.currentuserId;
    // currentuserId
    console.log(feedback);

    try {
        await userdbInstance.userdb.query('BEGIN');
        const insertProductResult = await userdbInstance.userdb.query(`INSERT INTO public.feedback(
            userid, feedback,last_updated_by)
                VALUES ($1, $2, $3);`, [currentuserId, feedback, currentuserId]);
        await userdbInstance.userdb.query('COMMIT');
        if (insertProductResult.rowCount === 1) {
            res.json({ message: "Thank you! for your Feedback", status: true });
        } else {
            res.status(404).json({ message: "User not found", status: false });
        }
    } catch (error) {
        console.error('Error executing database query:', error);
        if (error.code === '23505') {
            res.json({ message: "Unique constraint violation: Duplicate entry", status: false });
        } else {
            res.status(500).json({ message: "Internal Server Error", status: false });
        }
    }
}

async function insertCustomerOrder(req,res){
    try {
        let receiverid = req.body.order_data.receiverid;
        console.log("receiver id:\t"+receiverid);
        const req_data = req.body.order_data;

        const receiver_data = await userdbInstance.userdb.query('SELECT * FROM public."user" WHERE userid=$1',[receiverid]);
        let upi_id = receiver_data.rows[0].upiid;
      
        await userdbInstance.userdb.query('BEGIN');
        const insertProductResult = await userdbInstance.userdb.query(`INSERT INTO public.order_management(
            hsncode, cgst, sgst, quantity, grandtotal, order_date, receiverid, position_id, order_status, sender_id, payment_method, last_updated_by, upi_id,cgst_amount, sgst_amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14,$15) RETURNING order_id `, [req_data.product_id,req_data.cgst,req_data.sgst,req_data.no_of_product,req_data.total_price_amount,req_data.invoice_date,req_data.receiverid,req_data.positionid,0,req_data.sender_id,req_data.payment_method,req_data.sender_id,upi_id,req_data.cgst_amount,req_data.sgst_amount]);
        
        await userdbInstance.userdb.query('COMMIT');


        const order_id =  insertProductResult.rows[0].order_id;
        console.log("order id is:\t"+order_id);
        // Collect data for batch insert
        console.log("order item in customer");
        console.log(req.body.order_item);
        const insertData = req.body.order_item.map(item => {
            return [
                order_id,
                item.product_id,
                item.quantity, 
                req_data.total_price_amount,
                item.cgst, 
                item.sgst, 
                item.batch_no,
                req_data.sender_id,
                item.product_price, 
            ];
        });
       
        req.body.order_item.map(async(item,index)=>{
            console.log("product updation batch number is :\t"+item.batch_no+" the product id is :\t"+item.product_id);
            console.log(item.remaining+" then the poductid is:\t"+item.product_id+"req data is:\t"+req_data.receiverid+" the batch number is:\t"+item.batch_no);
            var remaining_quantity = 0;
            if(parseInt(item.remaining)<0){
                remaining_quantity = 0;
            }else{
                remaining_quantity = item.remaining;
            }
            await userdbInstance.userdb.query('BEGIN');
            const product_update_multiple_rows = await userdbInstance.userdb.query(`UPDATE products SET quantity =$1 WHERE productid=$2 and belongsto=$3 and batchno=$4`,[remaining_quantity,item.product_id,req_data.receiverid,item.batch_no]);
            await userdbInstance.userdb.query('COMMIT');
        });
        
        console.log(insertData);
        await userdbInstance.userdb.query('BEGIN');
        const order_item = format(`INSERT INTO public.order_item(
            order_id, hsncode, product_quantity, total_amount, cgst, sgst, batch_no, last_updated_by, product_price)
            VALUES %L`,insertData);

        const insertion_result = await userdbInstance.userdb.query(order_item);
       
     
       
        await userdbInstance.userdb.query('COMMIT');
        console.log(receiver_data);
       
        const output = {
            receiver_data:receiver_data.rows[0],
            total_amount:req_data.total_price_amount,
            payment_method:req_data.payment_method,
        };
        res.json({message:"successfully insert",data:output,status:true});

    } catch (error) {
        console.log("Error Customer order insertion error");
        res.json({message:"Customer order insertion error",status:flase});
    }
}

module.exports = { addUser, addInvoice,ProformaInvoice, addProduct, addfeedback ,insertCustomerOrder};