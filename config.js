module.exports = {

    // Sharing options
    // determines if sharing is enabled on this server
    serveSharing : false,
    // the path the shared files are placed into
    sharePath : "code/shares/",
    // limit settings for sharing
    shareLimits : {
        // time window, in which IPs are being tracked in ms
        windowMs: 60*1000,
        // the amount of allowed requests per time window
        max: 12,
        // minimum timeout between requests
        delayMs: 0
    },

    // Code example options
    // determines if any examples are served from this server
    serveExamples : false,
    // the path the provided examples are placed into
    examplePath : "code/examples/",

    // Frontend options
    // determines if the frontend is being served from this server
    serveFrontend : true,
    // the path the frontend is served from
    frontendPath : "SOSML-frontend/frontend/build",

    // General options
    // the port the server is listening to
    port : 8088

}
