import React from "react";

class LoadingPage extends React.Component {
  render() {
    return (
      <div className="fixed bg-black left-0 top-0 bottom-0 right-0 flex justify-center items-center">
        <video
          autoPlay
          loop
          muted
          className="loading-video fadeInOut w-[300px]" // Add your custom animation class here
        >
          <source src={"/loading.mp4"} type="video/mp4" />
        </video>
      </div>
    );
  }
}

export default LoadingPage;
