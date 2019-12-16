#version 400 core

uniform float firstPass;
uniform sampler2D prevPos;
uniform sampler2D prevVel;
uniform sampler2D prevCol;
uniform int numParticles;

uniform int resolutionX;
uniform int resolutionY;
// output from quad.vert
in vec2 uv;
//out int index;

// TODO [Task 15] setup the output locations
layout(location = 0) out vec4 pos;
layout(location = 1) out vec4 vel;
layout(location = 2) out vec4 col;

const float PI = 3.14159;
const float dt = 0.0167; // 1 sec/60 fps

/*
    A particle has the following properties:
        - pos.xyz = clip space position
        - pos.w = lifetime in seconds (doesn't change)
        - vel.xyz = clip space velocity
        - vel.w = current age in seconds
*/

// A helpful procedural "random" number generator
float hash(float n) { return fract(sin(n)*753.5453123); }

// Helper functions to procedurally generate lifetimes and initial velocities
// based on particle index
float calculateLifetime(int index) {
    index = 3;
    const float MAX_LIFETIME = 5.0;
    const float MIN_LIFETIME = 0.5;
    return MIN_LIFETIME + (MAX_LIFETIME - MIN_LIFETIME) * hash(index * 2349.2693);
//    return 100000000;
}

vec2 calculateInitialVelocity(int index) {
    index = 3;
    float theta = PI * hash(index * 872.0238);
    const float MAX_VEL = 0.3;
    float velMag = MAX_VEL * hash(index * 98723.345);
    return velMag * vec2(cos(theta), sin(theta));
}

vec4 initPosition(float index) {
//    //Original
    vec3 spawn = vec3(0);
    return vec4(spawn, calculateLifetime(int(index)));

//    float t = index / 5;
//    vec3 initpos = vec3( 0.5 * cos(t),0.5 * cos(t*1.3f),0.5 * cos(t*1.7f));
//    vec3 initpos = vec3(0.2f, 0.2f, 0.0f);
//    vec3 initpos = vec3(t);

//    return vec4(initpos, calculateLifetime(int(index))); //w=1.0 for the sake of existence

}

vec4 initVelocity(int index) {
    return vec4(calculateInitialVelocity(index), 0, 0);
}

vec4 updatePosition(int index) {
    // TODO [Task 16]
    // - sample prevPos and prevVel at uv
    // - xyz: pos + vel * dt
    // - w component is lifetime, so keep it from the previous position
    vec2 texelSize = 1.0 / textureSize(prevCol, 0).xy;

    vec4 pos0 = texture(prevPos, uv);
    vec4 vel0 = texture(prevVel, uv);

    vec4 update = vec4(vel0.xyz * dt, 0);
    vec4 pos1 = pos0 + update;

    pos1 = pos0;
    pos1.w = pos0.w;

//    //If new position is occupied with previous motion; change velocity direction to the opposite
//    int boxsize = 30;
//    for(int i =-boxsize; i<boxsize; i++){
//        for(int j =-boxsize; j<boxsize; j++){

//            vec4 color = texture(prevCol, vec2(pos1.x + i *texelSize.x, pos1.y + j *texelSize.y));
//            if(abs(color.r - 1.0) < 0.00001){
////                vel1.xyz = -vel1.xyz;
//                pos1.x = 0.0;
//                pos1.y = 0.0;
//                pos1.z = 0.0;

//                col = vec4(0.5, 0.0, 0.0, 1.0);

//                break;
//            }
//        }
//    }

    return pos1;
}

vec4 updateVelocity(int index, vec4 newPos) {
    const float G = -0.1;
    // TODO [Task 16]
    // - sample prevVel at uv
    // - only force is gravity in y direction.  Add G * dt.
    // - w component is age, so add dt

    vec2 texelSize = 1.0 / textureSize(prevCol, 0).xy;

    vec4 vel0 = texture(prevVel, uv);
    vec4 update = vec4(0.5 * G * dt, 2 * G * dt,0,dt);
    if(index==2){
        update = vec4(0, G * dt,0,dt);
    }
    vec4 vel1 = vel0 + update;

    for(float i =0; i < textureSize(prevPos, 0).x; i++){
        for(float j=0; j < textureSize(prevPos, 0).y; j++){
            float d = length(newPos - texture(prevPos, vec2(i,j)));
            if(d < 0.1){
                vel1.xyz = -1 * vel1.xyz;
            }
        }
    }


    return vel1;
}

vec4 updateColor(vec4 newPos) {
    //If new position is occupied with previous motion; change velocity direction to the opposite
    vec4 col = vec4(1, 1, 0, 1);
    vec4 pos0 = texture(prevPos, uv);

    vec4 color = texture(prevCol, vec2(0.5005, 0.5005));
    if(color.r > 0.0){
        col = vec4(1, 0, 0, 1);

    }
    return col;
}


void main() {
    float findex = uv.x * numParticles;
    int index = int(uv.x * numParticles);
    col = vec4(1, 1, 0, 1);
    if (firstPass > 0.5) {
        pos = initPosition(findex);
        vel = initVelocity(index);
    } else {
        pos = updatePosition(index);
        vel = updateVelocity(index, pos);
        col = updateColor(pos);

//        if (pos.w < vel.w) {
//            pos = initPosition(index);
//            vel = initVelocity(index);
//        }

//        pos = initPosition(index);
    }


}
