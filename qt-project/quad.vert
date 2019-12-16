#version 400 core

layout(location = 0) in vec3 position;
layout(location = 2) in vec2 inUV;

out vec2 uv;

void main() {
    uv = inUV;
    gl_Position = vec4(position, 1.0);


//    uv = gl_Position.xy;
//    uv = (gl_Position.xy * 2.0 ) - 1.0;
}
