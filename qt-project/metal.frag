#version 330 core

in vec3 vertex;                 // The position of the vertex, in camera space
in vec3 vertexToLight;          // Vector from the vertex to the light
in vec3 vertexToCamera;            // Vector from the vertex to the eye
in vec3 eyeNormal;		// Normal of the vertex, in camera space

uniform samplerCube envMap;	// The cube map containing the environment to reflect
uniform vec4 ambient;		// The ambient channel of the color to reflect
uniform vec4 diffuse;		// The diffuse channel of the color to reflect
uniform vec4 specular;		// The specular channel of the color to reflect

uniform mat4 model;             // model matrix
uniform mat4 view;              // view matrix
uniform mat4 mvp;               // model view projection matrix

uniform float r0;		// The Fresnel reflectivity when the incident angle is 0
uniform float m;		// The roughness of the material

out vec4 fragColor;

void main()
{
    vec3 n = normalize(eyeNormal);
    vec3 l = normalize(vertexToLight);
    vec3 v = normalize(vertexToCamera);
    vec3 cameraToVertex = normalize(vertex); //remember we are in camera space!

    //TODO: fill the rest in
    vec3 h = normalize(l + v);
    float alpha = acos(dot(n,h));
    float D = (exp(-pow(tan(alpha),2)/pow(m,2)))/(4*pow(m,2)*pow(cos(alpha),4));
    float F = r0 + (1-r0)*pow((1-dot(n,-cameraToVertex)),5);
    float G = min(min(1.0, (2*dot(h,n)*dot(h,n))/dot(v,h)), (2*dot(h,n)*dot(l,n))/(dot(v,h)));
    float ks = max(0, D*F*G / (dot(v,n)));
    vec4 objectColor = ambient + dot(n,l) * diffuse + ks * specular ;

    vec3 refDir = reflect(cameraToVertex,n);
    vec4 ref = transpose(inverse(view)) * vec4(refDir.x, refDir.y, refDir.z,0);
    vec4 reflectColor = texture(envMap, ref.xyz);
    fragColor = mix(objectColor,  reflectColor, F);

}
