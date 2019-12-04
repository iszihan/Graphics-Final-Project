#include "glwidget.h"
#include "settings.h"
#include <math.h>

#include "cs123_lib/resourceloader.h"
#include "openglshape.h"

#include "gl/shaders/ShaderAttribLocations.h"

#include <iostream>

#define FLAG 1

using namespace CS123::GL;

#define PI 3.14159265

GLWidget::GLWidget(QGLFormat format, QWidget *parent)
    : QGLWidget(format, parent),
      m_program(0),
      m_triangle(nullptr),
      m_strip(nullptr),
      m_fan(nullptr)
{
}

GLWidget::~GLWidget()
{
}

void GLWidget::initializeGL() {
    ResourceLoader::initializeGlew();
    if (FLAG == 1)
        m_program = ResourceLoader::createShaderProgram(":/shaders/shader.vert", ":/shaders/metaball.frag");
    else
        m_program = ResourceLoader::createShaderProgram(":/shaders/shader.vert", ":/shaders/shader.frag");
    glViewport(0, 0, width(), height());
    glEnable(GL_CULL_FACE); // Hides the back faces of triangles.
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f); // Defines the color the screen will be cleared to.

    initializeTriangle();
    initializeStrip();
    initializeFan();
}

//void GLWidget::mouseMoveEvent(QMouseEvent *event) {
//    if (event->buttons() & Qt::LeftButton) {
//        camera->mouseDragged(event->x(), event->y());
//    }
//    s_mouse->parse(QString("%1,%2,%3").arg(
//                       QString::number(event->x()),
//                       QString::number(event->y()),
//                       QString::number(mouseDown)));
//}

//void GLWidget::wheelEvent(QWheelEvent *event)
//{
//    camera->mouseScrolled(event->delta());
//}

//void GLWidget::mousePressEvent(QMouseEvent *event) {
//    camera->mouseDown(event->x(), event->y());
//    mouseDown = true;
//    s_mouse->parse(QString("%1,%2,%3").arg(
//                       QString::number(event->x()),
//                       QString::number(event->y()),
//                       QString::number(mouseDown)));
//}

//void GLWidget::mouseReleaseEvent(QMouseEvent *event) {
//    mouseDown = false;
//    s_mouse->parse(QString("%1,%2,%3").arg(
//                       QString::number(event->x()),
//                       QString::number(event->y()),
//                       QString::number(mouseDown)));
//}


void GLWidget::paintGL() {
    glUseProgram(m_program);       // Installs the shader program. You'll learn about this later.
    glClear(GL_COLOR_BUFFER_BIT);  // Clears the color buffer. (i.e. Sets the screen to black.)

    // This draws only the lines of the triangles if "Draw lines only" is checked. Otherwise they
    // are filled in like normal.
    glPolygonMode(GL_FRONT_AND_BACK, settings.linesEnabled ? GL_LINE : GL_FILL);
    // DONE [Task 8-10]: Draw shapes in the appropriate switch case.
    glUniform1i(glGetUniformLocation(m_program, "resolutionX"), this->size().width());
    glUniform1i(glGetUniformLocation(m_program, "resolutionY"), this->size().height());
    if (FLAG == 1) {
        float t = QTime::currentTime().minute() * 60.f + QTime::currentTime().second() + QTime::currentTime().msec() / 1000.f;
        glUniform1f(glGetUniformLocation(m_program, "iTime"), t);
    }

    switch (settings.shape) {
        case SHAPE_TRIANGLE:
            initializeTriangle();
            m_triangle->draw();
            break;
        case SHAPE_TRIANGLE_STRIP:
            initializeStrip();
            m_strip->draw();
            break;
        case SHAPE_TRIANGLE_FAN:
            initializeFan();
            m_fan->draw();
            break;
    }

    update();
    // glUseProgram(0); // Uninstalls the shader program.
}

void GLWidget::resizeGL(int w, int h) {
    glViewport(0, 0, w, h);
}

void GLWidget::initializeTriangle() {
    m_triangle = std::make_unique<OpenGLShape>();
    // DONE [Task 7]
    std::vector<float> vec = std::vector<float> {0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0};
    m_triangle->setVertexData(vec.data(), 9,
                              VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLES, 3);
    m_triangle->setAttribute(ShaderAttrib::POSITION, 3, 0,
                 VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_triangle->buildVAO();
}

void GLWidget::initializeStrip() {
    m_strip = std::make_unique<OpenGLShape>();
    // DONE [Task 9]
    std::vector<float> vec = std::vector<float> {1.f, -1.f, 0.0,
            1.f, 1.f, 0.0,
            -1.f, -1.f, 0.0,
            -1.f, 1.f, 0.0};
    m_strip->setVertexData(vec.data(), 12,
                           VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLE_STRIP,
                           4);
    m_strip->setAttribute(ShaderAttrib::POSITION, 3, 0,
                          VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_strip->buildVAO();
}

void GLWidget::initializeFan() {
    m_fan.reset(new OpenGLShape());
    // DONE [Task 10]
    std::vector<float> vec = std::vector<float> {0.0, 0.0, 0.0,
            0.0, 0.4, 0.0,
            -0.3, 0.2, 0.0,
            -0.3, -0.2, 0.0,
            0.0, -0.4, 0.0,
            0.3, -0.2, 0.0,
            0.3, 0.2, 0.0,
            0.0, 0.4, 0.0};
    m_fan->setVertexData(vec.data(), 24,
                           VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLE_FAN,
                           8);
    m_fan->setAttribute(ShaderAttrib::POSITION, 3, 0,
                          VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_fan->buildVAO();
}
