/********************************************************************************
** Form generated from reading UI file 'mainwindow.ui'
**
** Created by: Qt User Interface Compiler version 5.11.3
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_MAINWINDOW_H
#define UI_MAINWINDOW_H

#include <QtCore/QVariant>
#include <QtWidgets/QApplication>
#include <QtWidgets/QCheckBox>
#include <QtWidgets/QFrame>
#include <QtWidgets/QHBoxLayout>
#include <QtWidgets/QLabel>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QPushButton>
#include <QtWidgets/QSpacerItem>
#include <QtWidgets/QVBoxLayout>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_MainWindow
{
public:
    QWidget *centralWidget;
    QHBoxLayout *horizontalLayout;
    QVBoxLayout *verticalLayout;
    QLabel *label;
    QPushButton *shader1Button;
    QPushButton *shader2Button;
    QPushButton *raymarchSbShaderButton;
    QPushButton *raytraceSbShaderButton;
    QFrame *line;
    QVBoxLayout *verticalLayout_4;
    QLabel *label_2;
    QPushButton *sphereButton;
    QFrame *line_2;
    QFrame *line_3;
    QFrame *line_4;
    QLabel *label_5;
    QCheckBox *wireframeCheckbox;
    QCheckBox *checkBox;
    QFrame *line_5;
    QPushButton *cubeButton;
    QSpacerItem *verticalSpacer;
    QVBoxLayout *verticalLayout_2;
    QSpacerItem *horizontalSpacer;
    QVBoxLayout *verticalLayout_3;
    QPushButton *tipsButton;
    QVBoxLayout *uniformContainerUI;
    QSpacerItem *verticalSpacer_2;

    void setupUi(QMainWindow *MainWindow)
    {
        if (MainWindow->objectName().isEmpty())
            MainWindow->setObjectName(QStringLiteral("MainWindow"));
        MainWindow->resize(1100, 700);
        MainWindow->setAutoFillBackground(false);
        centralWidget = new QWidget(MainWindow);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        QSizePolicy sizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
        sizePolicy.setHorizontalStretch(0);
        sizePolicy.setVerticalStretch(0);
        sizePolicy.setHeightForWidth(centralWidget->sizePolicy().hasHeightForWidth());
        centralWidget->setSizePolicy(sizePolicy);
        horizontalLayout = new QHBoxLayout(centralWidget);
        horizontalLayout->setSpacing(6);
        horizontalLayout->setContentsMargins(11, 11, 11, 11);
        horizontalLayout->setObjectName(QStringLiteral("horizontalLayout"));
        verticalLayout = new QVBoxLayout();
        verticalLayout->setSpacing(0);
        verticalLayout->setObjectName(QStringLiteral("verticalLayout"));
        label = new QLabel(centralWidget);
        label->setObjectName(QStringLiteral("label"));

        verticalLayout->addWidget(label);

        shader1Button = new QPushButton(centralWidget);
        shader1Button->setObjectName(QStringLiteral("shader1Button"));

        verticalLayout->addWidget(shader1Button);

        shader2Button = new QPushButton(centralWidget);
        shader2Button->setObjectName(QStringLiteral("shader2Button"));

        verticalLayout->addWidget(shader2Button);

        raymarchSbShaderButton = new QPushButton(centralWidget);
        raymarchSbShaderButton->setObjectName(QStringLiteral("raymarchSbShaderButton"));

        verticalLayout->addWidget(raymarchSbShaderButton);

        raytraceSbShaderButton = new QPushButton(centralWidget);
        raytraceSbShaderButton->setObjectName(QStringLiteral("raytraceSbShaderButton"));

        verticalLayout->addWidget(raytraceSbShaderButton);

        line = new QFrame(centralWidget);
        line->setObjectName(QStringLiteral("line"));
        line->setFrameShape(QFrame::HLine);
        line->setFrameShadow(QFrame::Sunken);

        verticalLayout->addWidget(line);

        verticalLayout_4 = new QVBoxLayout();
        verticalLayout_4->setSpacing(6);
        verticalLayout_4->setObjectName(QStringLiteral("verticalLayout_4"));

        verticalLayout->addLayout(verticalLayout_4);

        label_2 = new QLabel(centralWidget);
        label_2->setObjectName(QStringLiteral("label_2"));

        verticalLayout->addWidget(label_2);

        sphereButton = new QPushButton(centralWidget);
        sphereButton->setObjectName(QStringLiteral("sphereButton"));

        verticalLayout->addWidget(sphereButton);

        line_2 = new QFrame(centralWidget);
        line_2->setObjectName(QStringLiteral("line_2"));
        line_2->setFrameShape(QFrame::HLine);
        line_2->setFrameShadow(QFrame::Sunken);

        verticalLayout->addWidget(line_2);

        line_3 = new QFrame(centralWidget);
        line_3->setObjectName(QStringLiteral("line_3"));
        line_3->setFrameShape(QFrame::HLine);
        line_3->setFrameShadow(QFrame::Sunken);

        verticalLayout->addWidget(line_3);

        line_4 = new QFrame(centralWidget);
        line_4->setObjectName(QStringLiteral("line_4"));
        line_4->setFrameShape(QFrame::HLine);
        line_4->setFrameShadow(QFrame::Sunken);

        verticalLayout->addWidget(line_4);

        label_5 = new QLabel(centralWidget);
        label_5->setObjectName(QStringLiteral("label_5"));

        verticalLayout->addWidget(label_5);

        wireframeCheckbox = new QCheckBox(centralWidget);
        wireframeCheckbox->setObjectName(QStringLiteral("wireframeCheckbox"));
        wireframeCheckbox->setFocusPolicy(Qt::StrongFocus);
        wireframeCheckbox->setChecked(true);
        wireframeCheckbox->setTristate(false);

        verticalLayout->addWidget(wireframeCheckbox);

        checkBox = new QCheckBox(centralWidget);
        checkBox->setObjectName(QStringLiteral("checkBox"));

        verticalLayout->addWidget(checkBox);

        line_5 = new QFrame(centralWidget);
        line_5->setObjectName(QStringLiteral("line_5"));
        line_5->setFrameShape(QFrame::HLine);
        line_5->setFrameShadow(QFrame::Sunken);

        verticalLayout->addWidget(line_5);

        cubeButton = new QPushButton(centralWidget);
        cubeButton->setObjectName(QStringLiteral("cubeButton"));

        verticalLayout->addWidget(cubeButton);

        verticalSpacer = new QSpacerItem(20, 40, QSizePolicy::Minimum, QSizePolicy::Expanding);

        verticalLayout->addItem(verticalSpacer);


        horizontalLayout->addLayout(verticalLayout);

        verticalLayout_2 = new QVBoxLayout();
        verticalLayout_2->setSpacing(0);
        verticalLayout_2->setObjectName(QStringLiteral("verticalLayout_2"));
        verticalLayout_2->setSizeConstraint(QLayout::SetDefaultConstraint);
        horizontalSpacer = new QSpacerItem(200, 0, QSizePolicy::MinimumExpanding, QSizePolicy::Minimum);

        verticalLayout_2->addItem(horizontalSpacer);


        horizontalLayout->addLayout(verticalLayout_2);

        verticalLayout_3 = new QVBoxLayout();
        verticalLayout_3->setSpacing(6);
        verticalLayout_3->setObjectName(QStringLiteral("verticalLayout_3"));
        tipsButton = new QPushButton(centralWidget);
        tipsButton->setObjectName(QStringLiteral("tipsButton"));

        verticalLayout_3->addWidget(tipsButton);

        uniformContainerUI = new QVBoxLayout();
        uniformContainerUI->setSpacing(6);
        uniformContainerUI->setObjectName(QStringLiteral("uniformContainerUI"));

        verticalLayout_3->addLayout(uniformContainerUI);

        verticalSpacer_2 = new QSpacerItem(20, 40, QSizePolicy::Minimum, QSizePolicy::Expanding);

        verticalLayout_3->addItem(verticalSpacer_2);


        horizontalLayout->addLayout(verticalLayout_3);

        MainWindow->setCentralWidget(centralWidget);

        retranslateUi(MainWindow);

        QMetaObject::connectSlotsByName(MainWindow);
    } // setupUi

    void retranslateUi(QMainWindow *MainWindow)
    {
        MainWindow->setWindowTitle(QApplication::translate("MainWindow", "Shader Visualizer", nullptr));
        label->setText(QApplication::translate("MainWindow", "Shaders:", nullptr));
        shader1Button->setText(QApplication::translate("MainWindow", "Metal", nullptr));
        shader2Button->setText(QApplication::translate("MainWindow", "Glass", nullptr));
        raymarchSbShaderButton->setText(QApplication::translate("MainWindow", "Soap Bubble (Raymarched)", nullptr));
        raytraceSbShaderButton->setText(QApplication::translate("MainWindow", "Soap Bubble (Raytraced)", nullptr));
        label_2->setText(QApplication::translate("MainWindow", "Shapes:", nullptr));
        sphereButton->setText(QApplication::translate("MainWindow", "Sphere", nullptr));
        label_5->setText(QApplication::translate("MainWindow", "Wireframe:", nullptr));
        wireframeCheckbox->setText(QApplication::translate("MainWindow", "Enabled", nullptr));
        checkBox->setText(QApplication::translate("MainWindow", "Use Vertex Shader", nullptr));
        cubeButton->setText(QApplication::translate("MainWindow", "Enable/Disable Collision ", nullptr));
        tipsButton->setText(QApplication::translate("MainWindow", "Tips", nullptr));
    } // retranslateUi

};

namespace Ui {
    class MainWindow: public Ui_MainWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_MAINWINDOW_H
