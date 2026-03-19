# distribution

This is the distribution library. 

## Environment Setup

We recommend using the prepared [container image](https://github.com/brown-cs1380/container).

## Installation

After you have setup your environment, you can start using the distribution library.
When loaded, distribution introduces functionality supporting the distributed execution of programs. To download it:

```sh
$ npm i '@brown-ds/distribution'
```

This command downloads and installs the distribution library.

## Testing

There are several categories of tests:
  *	Regular Tests (`*.test.js`)
  *	Scenario Tests (`*.scenario.js`)
  *	Extra Credit Tests (`*.extra.test.js`)
  * Student Tests (`*.student.test.js`) - inside `test/test-student`

### Running Tests

By default, all regular tests are run. Use the options below to run different sets of tests:

1. Run all regular tests (default): `$ npm test` or `$ npm test -- -t`
2. Run scenario tests: `$ npm test -- -c` 
3. Run extra credit tests: `$ npm test -- -ec`
4. Run the `non-distribution` tests: `$ npm test -- -nd`
5. Combine options: `$ npm test -- -c -ec -nd -t`

## Usage

To try out the distribution library inside an interactive Node.js session, run:

```sh
$ node
```

Then, load the distribution library:

```js
> let distribution = require("@brown-ds/distribution")();
> distribution.node.start(console.log);
```

Now you have access to the full distribution library. You can start off by serializing some values. 

```js
> s = distribution.util.serialize(1); // '{"type":"number","value":"1"}'
> n = distribution.util.deserialize(s); // 1
```

You can inspect information about the current node (for example its `sid`) by running:

```js
> distribution.local.status.get('sid', console.log); // null 8cf1b (null here is the error value; meaning there is no error)
```

You can also store and retrieve values from the local memory:

```js
> distribution.local.mem.put({name: 'nikos'}, 'key', console.log); // null {name: 'nikos'} (again, null is the error value) 
> distribution.local.mem.get('key', console.log); // null {name: 'nikos'}

> distribution.local.mem.get('wrong-key', console.log); // Error('Key not found') undefined
```

You can also spawn a new node:

```js
> node = { ip: '127.0.0.1', port: 8080 };
> distribution.local.status.spawn(node, console.log);
```

Using the `distribution.all` set of services will allow you to act 
on the full set of nodes created as if they were a single one.

```js
> distribution.all.status.get('sid', console.log); // {} { '8cf1b': '8cf1b', '8cf1c': '8cf1c' } (now, errors are per-node and form an object)
```

You can also send messages to other nodes:

```js
> distribution.local.comm.send(['sid'], {node: node, service: 'status', method: 'get'}, console.log); // null 8cf1c
```

Most methods in the distribution library are asynchronous and take a callback as their last argument.
This callback is invoked when the method completes, with the first argument being an error (if any) and the second argument being the result.
The following runs the sequence of commands described above inside a script (note the nested callbacks):

```js
let distribution = require("@brown-ds/distribution")();
// Now we're only doing a few of the things we did above
const out = (cb) => {
  distribution.local.status.stop(cb); // Shut down the local node
};
distribution.node.start(() => {
  // This will run only after the node has started
  const node = {ip: '127.0.0.1', port: 8765};
  distribution.local.status.spawn(node, (e, v) => {
    if (e) {
      return out(console.log);
    }
    // This will run only after the new node has been spawned
    distribution.all.status.get('sid', (e, v) => {
      // This will run only after we communicated with all nodes and got their sids
      console.log(v); // { '8cf1b': '8cf1b', '8cf1c': '8cf1c' }
      // Shut down the remote node
      distribution.local.comm.send([], {service: 'status', method: 'stop', node: node}, () => {
        // Finally, stop the local node
        out(console.log); // null, {ip: '127.0.0.1', port: 1380}
      });
    });
  });
});
```

# Results and Reflections


# M1: Serialization / Deserialization


## Summary

My implementation comprises of around 150 lines fo code for the serialization and deserialization components. My general approach for serailization was to get the received object into an object of the form {"type": type, "value" value} that then allows for easy transformation to a string using JSON.stringify, going case by case to handle data types that were exceptions like Error, Date, Object, Array and transform them into that structure. For deserialization, my approach was json.parse the string  and to recursively create the object out of the simple type, value structure, with exception handling for objects like Error and Date especially


## Correctness & Performance Characterization


*Correctness*: I wrote 5 tests; these tests take 0.11s to execute. This includes basic objects corresponding to all expected data types, different structures of functions (named, recursive, arrow funtions), and edge cases like large recursive structures like trees, recursive error objects, large arrays, and non-serializable objects.


*Performance*: The latency of various subsystems is described in the `"latency"` portion of package.json, each corresponding to ms it takes to serialize and then deserialize 1000 iterations on data objects I curated for T2-T4 (basic types, functions, recursive structures). The characteristics of my development machines are summarized in the `"dev"` portion of package.json.


# M2: Actors and Remote Procedure Calls (RPC)


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M2 (`hours`) and the lines of code per task.


My implementation comprises 4 software components, totaling 300 lines of code. Some challenges included figuring out how to setup the node http server as well as reasoning through lots of the logic with callbacks.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote 5 tests on various edge cases like overwriting services, basic putting a service and calling it using comm, no callback/missing parameters to function calls error checking, removing a nonexisting service; these tests take 3.6 seconds to execute.


*Performance*: I characterized the performance of comm and RPC by sending 1000 service requests in a tight loop. Average throughput and latency is recorded in `package.json`. In the form latency (ms/rq), throughput (req/sec), with the first entry being my benchmark_m2.js script in the scripts dir, the other being the benchmark_m2_rpc.js script in the scripts dir.


## Key Feature

> How would you explain the implementation of `createRPC` to someone who has no background in computer science — i.e., with the minimum jargon possible?

I'd say that RPC's purpose is to allow another node (think another person) to tell you to do a task that they need done but they don't want to do themself. createRPC does this by creating an instruction (stub) that you can send to another person that tells them how to get you to do the task instead of them. The other person can then invoke that instruction whenever they want, and it will cause you to do the task for them and they can retrieve the result -- importantly your friend doesn't need to know how to do the task for it to be done, they just need to call your instruction.


# M3: Node Groups & Gossip Protocols


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M3 (`hours`) and the lines of code per task.



My implementation comprises around 300 added lines of code over the previous implementation. I implemented all the components for node group communication including broadcasting messages to all nodes in a group in all.comm.js, gossip protocol in all.gossip.js and local.gossip.js. I also implemented local node spawning and stopping alongside their group equivalents. The main challenge for me was setting up gossip protocol and figuring out its implementation, as well as setting up logging and tracking execution on different nodes.


## Correctness & Performance Characterization



*Correctness* -- number of tests and time they take.
I wrote tests in m3.student.test.js that range from first testing basic functionality - putting, removing, getting from groups -- to then testing my all.groups functionaity, adding groups to all nodes within a group. I then ran some cases for gossip: first a basic gossip run with ten nodes and then testing to ensure that our expected messages from gossip protocol are less when I place differing, smaller representations of the group from some of the nodes in the group. Finally, I also tested that errors properly propagate in gossip to the caller, like when the group is not registered.

*Performance* -- spawn times (all students) and gossip (lab/ec-only).
Gossip: 100 nodes w/ a propagation of log(100) from each node takes 150 ms to propagate to all nodes, about 1.5 ms/node (locally), 10 nodes took 111ms about 11.1 ms./node (aws)
Spawning: 100 nodes spawned took 931 ms = 9.3 ms / node (locally), 10 nodes spawned took 435 ms = 43.5 ms / node (aws)


## Key Feature

> What is the point of having a gossip protocol? Why doesn't a node just send the message to _all_ other nodes in its group?

A gossip protocol allows us to send data with eventual consistency without much load on individual nodes or the network. If we had a really large number of nodes, sending one message from one node to all the other nodes in its group will put a large amount of load on that node and potentially stop it from being able to do other tasks. Gossip protocol also has high tolerance, its randomness and method allows it to reach other nodes through many different paths, overcoming dead nodes. Furthermore, with gossip single nodes only need to know of a few neighbors in their network and not track all other nodes.

# M4: Distributed Storage


## Summary

I added features for local memory and storage on nodes as well as a distributed storage system over a group of nodes. Groups use different hashing schemas like consistent hashing or rendezvous hashing to determine which node data is stored on. Furthermore, I implemented dyanmic reconfiguration of node groups, redistributing keys when changes are detected in the amount of nodes in a node group at a custom timer. One of the main challenges for me was reasoning through how reconf works and testing to ensure that my implementation worked properly.






## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation

I characterized correctness with 5 tests that cover basic distributed memory and storage functions - put/get/del and also cases like ensuring del/del resulted in an error and del/get would error, overriding puts is successful. I also extensively tested that get with a null parameter worked in different edge cases like with an empty key set, after putting multiple times. 

To characterize performance, I ran ran the distributed store on three aws nodes, and put and retrieved 1000 random objects. I found a throughput of 3200 objects / second for put, with a average latency of 180 ms/object. For get, I found a throughput of 48930 objects / second and an average latency of 102 ms.


## Key Feature

> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

The objects could take up a lot of memory and fetching all objects at once could bottleneck the node. Even more, most keys likely won't need to move nodes, so it we should first identify the keys that must move before getting their corresponding object as else it would be wasteful to retrieve the entire object for many keys that don't need to be relocated. 



# M5: Distributed Execution Engine


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M5 (`hours`) and the lines of code per task.


My implementation covers the all/mr.js file, totallling around 400 lines of code. I pretty closesly followed the design in the stencil, registering a map reduce service on each node in the group and creating an rpc function for notifying from group nodes to the distributor node. At the end of each stage - map, shuffle, reduce - the group nodes call the notify rpc function which upon receiving all notify requests from group, advances the current stage by invoking a callback passed to the notify function. At the end of reduce, each group node passes its final data to the notify function and the notify function returns that data to exec.


## Correctness & Performance Characterization

To characterize performance, I ran the given maximum temperature workflow many times in sequence on three local nodes and recorded the average time to complete, getting around 42 ms.


*Correctness*: I wrote 5 cases testing various map and reduce functions with edge cases like map reduce returning empty data, key collisions, and fan in from many values mapped to a single value.


*Performance*: My map reduce function can sustain 23.8 calls/second, with an average latency of 0.042 seconds per call for the max weather worfklow.


## Key Feature

No extra features were impelemented.