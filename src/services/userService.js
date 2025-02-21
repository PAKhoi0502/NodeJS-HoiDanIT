import { resolveInclude } from "ejs";
import db from "../models/index"
import bcrypt from 'bcryptjs';
import { where } from "sequelize";

const salt = bcrypt.genSaltSync(10);


let handleUserLogin = (email, password) => { // check email pass trong db
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};

            let isExist = await checkUserMail(email);

            if (isExist) {

                let user = await db.User.findOne({ //lấy pass từ db để so sánh với hash pass
                    attributes: ['email', 'roleId', 'password'], //lấy info từ db
                    where: { email: email },
                    raw: true // user trả về object
                });

                if (user) { // nếu user tồn tại

                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0,
                            userData.errMessage = 'OK';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3,
                            userData.errMessage = 'Wrong Password';
                    }

                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found~`
                }

            } else {
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't exist in your system. Pls try other email!`;
            }

            resolve(userData);

        } catch (e) {
            reject(e);
        }
    });
};


let checkUserMail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            };
        } catch (e) {
            reject(e);
        }
    });
}


let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password'] // remove password
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password'] // remove password
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e);
        }
    })
}


let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
};


let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email exist
            let check = await checkUserMail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is existed. Try another email!'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender == '1' ? true : false,
                    roleId: data.roleId
                })
                resolve({
                    errCode: 0,
                    message: 'Create New User Successfully ^.^'
                });
            }

        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            });
            if (!user) {
                return resolve({
                    errCode: 2,
                    errMessage: `The user isn't exist`
                });
            }
            await user.destroy();
            resolve({
                errCode: 0,
                errMessage: `The user is deleted`
            });
        } catch (error) {
            reject({
                errCode: -1,
                errMessage: "An error occurred while deleting the user"
            });
        }
    });
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            });
            if (user) {
                user.firstName = data.firstName
                user.lastName = data.lastName
                user.address = data.address

                await user.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update the user succeeds!'
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'User is not found'
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

export default {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
};