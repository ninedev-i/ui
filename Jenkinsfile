node ('controls') {
def version = "19.400"
def workspace = "/home/sbis/workspace/ui_${version}/${BRANCH_NAME}"
    ws (workspace){
        deleteDir()
        checkout([$class: 'GitSCM',
            //branches: [[name: "rc-${version}"]],
			branches: [[name: "19.400/feature/may/new-stage-for-tests-150519"]],
            doGenerateSubmoduleConfigurations: false,
            extensions: [[
                $class: 'RelativeTargetDirectory',
                relativeTargetDir: "jenkins_pipeline"
                ]],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: CREDENTIAL_ID_GIT,
                    url: "${GIT}:sbis-ci/jenkins_pipeline.git"]]
                                    ])
        helper = load "./jenkins_pipeline/platforma/branch/helper"
        start = load "./jenkins_pipeline/platforma/branch/JenkinsfileUI"
        run_unit = load "./jenkins_pipeline/platforma/branch/run_unit"
        timeout(time: 60, unit: 'MINUTES') {
            start.start(version, workspace, helper)
        }
    }
}
