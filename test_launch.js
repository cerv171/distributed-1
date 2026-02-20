const config = { 
    "ip": "127.0.0.1",
    "port": 8080,
};
const total = 20;
const distribution = require("./distribution.js")(config);
//test file
distribution.node.start(() => {
    let count = 0;
    bad_group = {};
    for (let i = 0; i < total; i++) {
        i_config = {
            "ip": "127.0.0.1",
            "port": 8081+i,
            onStart: () => {console.log(`started child ${i}`)},
        }
        if ((8081+i) % 2 == 0) {
            bad_group[distribution.util.id.getSID(i_config)] = i_config;
        }
        distribution.local.status.spawn(i_config, (e, v) => {
            count++;
            if (count == total) {
                setTimeout(() => {
                    const remote = {service: 'status', method: 'get'};
                    distribution.all.comm.send(['port'], remote, (e, v) => {
                        console.log(v);
                        distribution.local.groups.put('bad', bad_group, console.log);
                        setTimeout(() => {
                            distribution['bad'].comm.send(['port'], remote, console.log);
                        }, 1000);
                    });
                }, 5000);
            }
        });
    }
});