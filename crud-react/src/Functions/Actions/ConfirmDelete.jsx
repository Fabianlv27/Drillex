

function ConfirmDelete({ShowConfirmDelete,setShowConfirmDelete,HandlerDelete}) {
  return (
    <>
      {ShowConfirmDelete  ? (
        <div
          className="modal-overlay"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              height: "10rem",
              width: "20rem",
              backgroundColor: "rgb(7, 33, 56) ",
              border: "solid 2px rgb(0, 195, 255)",
              color: "rgb(0, 195, 255)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "20px" }}>Are you sure ?</p>
            <button
              style={{
                height: "30px",
                width: "80px",
                fontWeight: "bolder",
                backgroundColor: "green",
                marginTop: "20px",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
              onClick={ async () => {await HandlerDelete()} }
            >
              Accept
            </button>
            <button
              style={{
                height: "30px",
                width: "80px",
                fontWeight: "bolder",
                backgroundColor: "red",
                marginTop: "20px",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ConfirmDelete;
