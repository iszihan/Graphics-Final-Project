#include "Texture.h"

#include <cassert>
#include <utility>
#include <iostream>
#include <GL/glew.h>
#include "gl/GLDebug.h"

namespace CS123 { namespace GL {

Texture::Texture() :
    m_handle(0)
{
    // TODO [Task 2] Generate the texture

    glGenTextures(1,&m_handle);
    std::cout<<"inside texture constructor"<<m_handle<<std::endl;
}

Texture::Texture(Texture &&that) :
    m_handle(that.m_handle)
{
    that.m_handle = 0;
}

Texture& Texture::operator=(Texture &&that) {
    this->~Texture();
    m_handle = that.m_handle;
    that.m_handle = 0;
    return *this;
}

Texture::~Texture()
{
    // TODO Don't forget to delete!
    glDeleteTextures(1, &m_handle);
}

unsigned int Texture::id() const {
    std::cout<<"inside texture id"<<m_handle<<std::endl;

    return m_handle;
}

}}
