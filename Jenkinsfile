// Groovy-переменная для флага сборки
def shouldBuild = false

pipeline {
  agent any

  environment {
    GIT_CREDENTIALS = 'TSSH'                                 // учётка для доступа к Git
    REPO_URL        = 'git@github.com:artyomchumachenko/jefferson-front.git'
    BRANCH          = 'master'
    WORK_TREE       = '/opt/myapp/frontend'
    DEPLOY_DIR      = '/var/www/myapp/mai/jefferson'
    NGINX_SERVICE   = 'nginx.service'
  }

  stages {
    stage('Checkout & Fetch') {
      steps {
        sshagent([env.GIT_CREDENTIALS]) {
          sh '''
            # если нет папки .git, считаем, что репо не инициализировано
            if [ ! -d "$WORK_TREE/.git" ]; then
              echo "[$(date)] Обнаружена не-валидная папка $WORK_TREE, пересоздаём..."
              rm -rf "$WORK_TREE"
              git clone "$REPO_URL" --branch "$BRANCH" "$WORK_TREE"
            fi

            cd "$WORK_TREE"
            git fetch origin "$BRANCH"
          '''
        }
      }
    }

    stage('Check for Changes') {
      steps {
        dir("${WORK_TREE}") {
          script {
            def remote = sh(
              script: "git rev-parse origin/${BRANCH}",
              returnStdout: true
            ).trim()
            def local = sh(
              script: 'git rev-parse HEAD',
              returnStdout: true
            ).trim()

            if (remote != local) {
              echo "🔄 Новые коммиты: ${local} → ${remote}"
              sh "git reset --hard origin/${BRANCH}"
              shouldBuild = true
            } else {
              echo "✅ Нет новых коммитов (HEAD=${local}), пропускаем build/deploy"
            }
          }
        }
      }
    }

    stage('Build') {
      when {
        expression { shouldBuild }
      }
      steps {
        dir("${WORK_TREE}") {
          sh '''
            echo "[$(date)] npm ci"
            npm ci
            echo "[$(date)] npm run build"
            npm run build
          '''
        }
      }
    }

    stage('Deploy') {
      when {
        expression { shouldBuild }
      }
      steps {
        sh '''
          echo "[$(date)] Prepare deploy dir ${DEPLOY_DIR}"
          mkdir -p ${DEPLOY_DIR}
          rm -rf ${DEPLOY_DIR}/*

          echo "[$(date)] rsync dist → deploy"
          rsync -a --delete ${WORK_TREE}/dist/ ${DEPLOY_DIR}/

          echo "[$(date)] Test nginx config"
          if nginx -t; then
            echo "[$(date)] Reload nginx"
            systemctl reload ${NGINX_SERVICE}
          else
            echo "[$(date)] ERROR: nginx config failed"
            exit 1
          fi
        '''
      }
    }
  }

  post {
    success {
      script {
        if (shouldBuild) {
          echo '✅ Успешно собрали и задеплоили frontend'
        } else {
          echo 'ℹ️ Сборка и деплой не требуются (нет новых коммитов)'
        }
      }
    }
    failure {
      echo '❌ Ошибка, смотрите логи'
    }
  }
}
