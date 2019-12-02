#version 330 core

in vec3 vertex;                 // The position of the vertex, in camera space!
in vec3 vertexToCamera;         // Vector from the vertex to the eye, which is the camera
in vec3 eyeNormal;	        // Normal of the vertex, in camera space!

uniform float r0;		// The R0 value to use in Schlick's approximation
uniform float eta1D;		// The eta value to use initially
uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

uniform mat4 view;
uniform mat4 model;

uniform samplerCube envMap;

out vec4 fragColor;

void main()
{
    vec3 n = normalize(eyeNormal);
    vec3 cameraToVertex = normalize(vertex); //remember we are in camera space!
    vec3 vertexToCamera = normalize(vertexToCamera);
    // TODO: fill the rest in

    vec3 refDir = reflect(cameraToVertex,n);
    vec4 ref = transpose(inverse(view)) * vec4(refDir.x, refDir.y, refDir.z,0);
    vec4 reflectColor = texture(envMap, ref.xyz);

    vec3 refractDir_r = refract(cameraToVertex, n, eta.r);
    vec3 refractDir_g = refract(cameraToVertex, n, eta.g);
    vec3 refractDir_b = refract(cameraToVertex, n, eta.b);

    vec4 w_refractDir_r = transpose(inverse(view)) * vec4(refractDir_r.x, refractDir_r.y, refractDir_r.z,0);
    vec4 w_refractDir_g = transpose(inverse(view)) * vec4(refractDir_g.x, refractDir_g.y, refractDir_g.z,0);
    vec4 w_refractDir_b = transpose(inverse(view)) * vec4(refractDir_b.x, refractDir_b.y, refractDir_b.z,0);

    float refractColor_r = texture(envMap, w_refractDir_r.xyz).r;
    float refractColor_g = texture(envMap, w_refractDir_g.xyz).g;
    float refractColor_b = texture(envMap, w_refractDir_b.xyz).b;

    vec4 refractColor = vec4(refractColor_r, refractColor_g, refractColor_b, 1.0);
    float F = r0 + (1-r0)*pow((1-dot(n,-cameraToVertex)),5);

    fragColor = mix(refractColor, reflectColor, F);
}
