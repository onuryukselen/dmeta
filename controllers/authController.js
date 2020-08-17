const { get, post } = require('request');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const accessTokens = require('./../controllers/accessTokenController');
const refreshTokens = require('./../controllers/refreshTokenController');

const [getAsync, postAsync] = [get, post].map(promisify);

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const sendTokenCookie = (user, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  const rootUrl = `${req.protocol}://${req.get('host')}`;
  res.redirect(`${process.env.SSO_URL}api/v1/users/logout?redirect_uri=${rootUrl}`);
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; //alias for req.session.user
  res.locals.user = currentUser; // variables that used in the view while rendering (eg.pug)
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log('** isLoggedIn');
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      console.log(currentUser);
      if (!currentUser) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      console.log('isLoggedIn: user not logined');
      return next();
    }
  } else if (!req.session.loginCheck) {
    // check if its authenticated on Auth server
    req.session.loginCheck = true;
    req.session.redirectURL = '/';
    // const originalUrl = `${req.protocol}://${req.get('host')}`;
    const originalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.redirect(
      `${process.env.SSO_CHECKLOGIN_URL}?redirect_original=${originalUrl}&redirect_uri=${process.env.SSO_REDIRECT_URL}&response_type=code&client_id=${process.env.CLIENT_ID}&scope=offline_access`
    );
  }
  next();
};

exports.ensureSingleSignOn = async (req, res, next) => {
  // req.session.redirectURL = req.originalUrl || req.url;
  req.session.redirectURL = '/';
  res.redirect(
    `${process.env.SSO_AUTHORIZE_URL}?redirect_uri=${process.env.SSO_REDIRECT_URL}&response_type=code&client_id=${process.env.CLIENT_ID}&scope=offline_access`
  );
};

/**
 * https://localhost:4000/receivetoken?code=(authorization code)
 *
 * This is part of the single sign on using the OAuth2 Authorization Code grant type.  This is the
 * redirect from the authorization server.  If you send in a bad authorization code you will get the
 * response code of 400 and the message of
 * {
 *     "error": "invalid_grant",
 *     "error_description": "invalid code"
 * }
 * @param   {Object} req - The request which should have the parameter query of
 *                         ?code=(authorization code)
 * @param   {Object} res - We use this to redirect to the original URL that needed to
 *                         authenticate with the authorization server.
 * @returns {undefined}
 */

exports.ssoReceiveToken = async (req, res, next) => {
  // Get the token
  console.log('**ssoReceiveToken');
  try {
    const { statusCode, body } = await postAsync(process.env.SSO_TOKEN_URL, {
      form: {
        code: req.query.code,
        redirect_uri: process.env.SSO_REDIRECT_URL,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code'
      }
    });
    const msg = JSON.parse(body);
    console.log('msg', msg);
    console.log('statusCode', statusCode);
    const accessToken = msg.access_token;
    const refreshToken = msg.refresh_token;
    const expiresIn = msg.expires_in;

    if (statusCode === 200 && accessToken != null) {
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      const expirationDate = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

      const userInfoObj = await getAsync({
        url: process.env.SSO_USER_INFO_URL,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        rejectUnauthorized: false
      });
      const currentUser = JSON.parse(userInfoObj.body);
      const userStatusCode = userInfoObj.statusCode;
      console.log('currentUser', currentUser);
      console.log('userStatusCode', userStatusCode);
      const userId = currentUser._id;
      const scope = currentUser.scope;
      const email = currentUser.email;

      if (userStatusCode === 200 && userId) {
        try {
          const filter = { email: email };
          const update = { $set: { name: currentUser.name, email: email, scope: scope } };
          const options = { upsert: true, new: true, setDefaultsOnInsert: true };
          const updatedUser = await User.findOneAndUpdate(filter, update, options);
          console.log('updatedUser', updatedUser);
          res.locals.user = updatedUser;
          sendTokenCookie(updatedUser, req, res);

          await accessTokens.save(
            accessToken,
            expirationDate,
            userId,
            process.env.CLIENT_ID,
            scope
          );
          if (refreshToken != null) {
            await refreshTokens.save(refreshToken, userId, process.env.CLIENT_ID, scope);
          }
          res.redirect(req.session.redirectURL);
        } catch (err) {
          res.sendStatus(500);
        }
      } else {
        res.status(userStatusCode);
        res.send(userInfoObj.body);
      }
    } else {
      // Error, someone is trying to put a bad authorization code in
      res.status(statusCode);
      res.send(body);
    }
  } catch (e) {
    return next(new AppError('Login Failed', 403));
  }
};
