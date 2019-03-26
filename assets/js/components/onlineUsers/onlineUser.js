import React from "react";
import PropTypes from "prop-types";

const OnlineUser = ({ username, typing }) => (
  <li>
    {username}
    {typing && <b> typing...</b>}
  </li>
);

OnlineUser.propTypes = {
  username: PropTypes.string.isRequired,
  typing: PropTypes.bool.isRequired
};

export default OnlineUser;
