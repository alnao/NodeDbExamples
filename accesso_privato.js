module.exports = {
    accessoSicuro: function(req,res, next ){
        if (req.isAuthenticated()){
            return next();
        }
        req.flash('msg_errore','Errore di autenticazione');
        res.redirect('/login');
    }
}