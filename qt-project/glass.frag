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
    
    
    //calculate reflection diection
    
    vec3 reflected_direction=reflect(cameraToVertex, n);       //is surface normal the same thing as eye_normal??
    //convert to world space
    vec4 world_space_reflected_direction=(inverse(view)*vec4(reflected_direction,0.0));
    
    //sample texture color
    vec4 reflected_color=texture(envMap, world_space_reflected_direction.xzy);
    
    
    //get camera space refraction direction
    vec4 red_refracted_direction=vec4(refract(cameraToVertex,n,eta.r),0.0);
    vec4 green_refracted_direction=vec4(refract(cameraToVertex,n,eta.g),0.0);
    vec4 blue_refracted_direction=vec4(refract(cameraToVertex,n,eta.b),0.0);
    
    //get world space refraction direction
    vec4 world_space_red_refracted_direction=inverse(view)*red_refracted_direction;
    vec4 world_space_green_refracted_direction=inverse(view)*green_refracted_direction;
    vec4 world_space_blue_refracted_direction=inverse(view)*blue_refracted_direction;
    
    vec4 refracted_color=vec4(0.0,0.0,0.0,0.0);
    
    //sample refracted color
    refracted_color.r=texture(envMap,world_space_red_refracted_direction.xyz).r;
    refracted_color.g=texture(envMap,world_space_green_refracted_direction.xyz).g;
    refracted_color.b=texture(envMap,world_space_blue_refracted_direction.xyz).b;
    refracted_color.a=1.0;
    
    //calculate F from shlick's approximation
    float F=r0+(1-r0)*pow((1-dot(n, -1.0*cameraToVertex)),5);
    
    fragColor=mix(refracted_color, reflected_color, 1.0-F);
    //fragColor=reflected_color;
    //fragColor=vec4(1,0,0,0);

    
    
    
    
    


    //fragColor = vec4(0.0);
}
