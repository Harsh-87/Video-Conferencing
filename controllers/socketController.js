module.exports = function (io) {
    let broadcaster;
    io.sockets.on("error", e => console.log(e));
    io.sockets.on("connection", socket => {
        socket.on("newUser",(roomname,username)=>{
            socket.roomname=roomname;
            socket.username=username;
        });
        socket.on("broadcaster", () => {
            broadcaster = socket.id;
            socket.broadcast.to(socket.roomname).emit("broadcaster");
        });
        socket.on("watcher", () => {
            io.to(socket.roomname).to(broadcaster).emit("watcher", socket.id);
        });
        socket.on("offer", (id, message) => {
            io.to(socket.roomname).to(id).emit("offer", socket.id, message);
        });
        socket.on("answer", (id, message) => {
            io.to(socket.roomname).to(id).emit("answer", socket.id, message);
        });
        socket.on("candidate", (id, message) => {
            io.to(socket.roomname).to(id).emit("candidate", socket.id, message);
        });
        socket.on("disconnect", () => {
            io.to(socket.roomname).to(broadcaster).emit("disconnectPeer", socket.id);
        });
    });

}