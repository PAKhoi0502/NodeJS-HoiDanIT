import db from '../models/index';
import CRUDServices from '../services/CRUDServices';

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll(); // tim tat ca du lieu users trong db
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e);
    }

}

let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDServices.createNewUser(req.body);
    console.log(message);
    return res.send('Create User Succeed!');
}

let displayGetCRUD = async (req, res) => {
    let data = await CRUDServices.getAllUser();
    return res.render('displayCRUD.ejs', {
        dataTable: data
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDServices.getUserInfoById(userId);
        //check user data not found

        // let userdata
        return res.render('editCRUD.ejs', {
            user: userData //dùng user để in value bên editCRUD
        });
    } else {
        return res.send("User Not Found!!!");
    }

}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDServices.updateUserData(data); //lưu update vào
    return res.render('displayCRUD.ejs', {
        dataTable: allUsers //cập nhật sau khi update vào bảng
    });
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    await CRUDServices.deleteUserById(id);
    return res.send('Delete');
}

module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}