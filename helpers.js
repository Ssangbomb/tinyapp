function getUserByEmail(email, database) {
  for(const data in database) {
    const user = database[data];
    if(user.email === email) {
      // Found user
      return user;
    }
  }
  return undefined;
}

module.exports = { getUserByEmail }