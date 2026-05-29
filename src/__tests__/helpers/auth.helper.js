const createUser =
  require('./createUser');

async function getAuthToken() {
  const user =
    await createUser();

  return user.accessToken;
}

module.exports =
  getAuthToken;