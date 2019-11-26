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
    vec3 cameraToVertex = normalize(vertex); //remember we are in camera space!

    //TODO: fill the rest in
    
    //ambient
    vec4 ambient_intensity=ambient;
    
    //diffuse
    vec4 diffuse_intensity=diffuse * dot(n,l);
    
    //bring cameraToVertex to world coordinates
    vec3 world_cameraToVertex=(inverse(view)*vec4(cameraToVertex,0.0)).xyz;
    
    
    vec3 u=l;
    vec3 v=normalize(vertexToCamera);
    
    
    //get h
    vec3 h=normalize(u+v);
    
    
    //calculate alpha
    float alpha=acos(dot(n,h));
    
    //cauclate D
    float D= exp(-1.0*pow(tan(alpha),2)/pow(m,2)) / (4.0*pow(m,2)*pow(cos(alpha),4));
    
    //calculate F from shlick's approximation
    float F=r0+(1-r0)*pow((1-dot(n, -1.0*cameraToVertex)),5);
    
    float G=min(1,
                min(2*dot(n,h)*dot(v,n) / dot(v,h),  2*dot(n,h)*dot(u,n) / dot(v,h) ));
    
    
    
    float ks=D*F*G / dot(v,n);      // ------------- is V,N the same thing as v,n????
    
    //clamp >0;
    if(ks<0){
        ks=0;
    }
    
    
    //compute object color
    vec4 object_color=ambient_intensity + diffuse_intensity + ks*specular;
    
    

    //calculate reflection diection
    
    vec3 reflected_direction=reflect(cameraToVertex, n);       //is surface normal the same thing as eye_normal??
    //convert to world space
    vec4 world_space_reflected_direction=(inverse(view)*vec4(reflected_direction,0.0));
    
    //sample texture color
    vec4 reflected_color=texture(envMap, world_space_reflected_direction.xzy);
    fragColor=mix(object_color, reflected_color, F);
    
    
    
    
                        
                        
                          
                          

    //fragColor = vec4(0.0);
}
