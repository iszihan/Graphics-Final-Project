#version 400 core

uniform mat4 view;
uniform mat4 projection;

in vec3 position;

out vec3 pos_object;
out vec2 fragCoord;

const float scale = 8;

void main() {
     pos_object = position;
     gl_Position = projection * view * vec4(position * scale, 1);
     fragCoord = gl_Position.xy;

}
