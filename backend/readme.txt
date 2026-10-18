// user registeration ==>> '/api/auth/register'   | POST

// admin registration ==>> '/api/admin/register'   | POST , there is an middleware to validate that the req comming is from the 'admin' 
                                                        ==>>    only an admin can register other admin.
                                                        ==>>    an user cannot directly register himself as admin.
                                                        ==>>    after we register the admis successfully, the newAdmin has to login, as we will not send any token after registeration of admin.

