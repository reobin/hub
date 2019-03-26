import React from "react";
import PropTypes from "prop-types";
import OnlineUser from "./onlineUser";

const OnlineUserList = ({ onlineUsers }) => (
  <div className="online-user-list">
    <b>Online users :</b>
    <ul>
      {onlineUsers.map((user, index) => (
        <OnlineUser key={index} username={user.username} typing={user.typing} />
      ))}
    </ul>
  </div>
);

OnlineUserList.propTypes = {
  onlineUsers: PropTypes.array.isRequired
};

export default OnlineUserList;
