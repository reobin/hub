import React from "react";
import PropTypes from "prop-types";

const RoomLabel = props => {
  return <b className="room-title">Chat room : {props.roomName}</b>;
};

RoomLabel.propTypes = {
  roomName: PropTypes.string.isRequired
};

export default RoomLabel;
