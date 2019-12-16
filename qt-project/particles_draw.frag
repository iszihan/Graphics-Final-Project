#version 400 core

in vec2 uv;
in vec3 color;
//in int index;

out vec4 fragColor;

void main() {
    if(length(uv - 0.5) < 0.5){
        fragColor = vec4(color, 1);
    }else{
        discard;
    }
//    fragColor = index * vec4(3000.f);
//    fragColor = vec4(1);
    // TODO [Task 19] Only color fragment if length(uv - 0.5) < 0.5, else discard
}
