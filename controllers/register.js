const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password} = req.body;
	if (!email || !name || !password) {  //VALIDATION!!
		return res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password);
	// Transactions make sure that when we are doing multiple operations on a database,
	// if one fails then they all fail. If we can't enter something in the users database, 
	// the login will fail too.
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		// the in-built knex returning function is used instead of making another select
		// query to return the registered user
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
		.catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
	handleRegister: handleRegister
}