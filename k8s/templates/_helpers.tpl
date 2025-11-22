{{/*
Expand the name of the chart.
*/}}
{{- define "naver-hkt.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "naver-hkt.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "naver-hkt.labels" -}}
helm.sh/chart: {{ include "naver-hkt.chart" . }}
{{ include "naver-hkt.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "naver-hkt.selectorLabels" -}}
app.kubernetes.io/name: {{ include "naver-hkt.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "naver-hkt.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "naver-hkt.name" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Get the image name for a component
*/}}
{{- define "naver-hkt.image" -}}
{{- $repository := .repository }}
{{- $tag := .tag | default .Values.global.imageTag | default "latest" }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}

{{/*
Get the database URL
*/}}
{{- define "naver-hkt.databaseUrl" -}}
{{- printf "postgresql://%s:%s@%s:%s/%s" .Values.secrets.dbUser .Values.secrets.dbPassword (printf "%s-database" (include "naver-hkt.name" .)) (.Values.database.service.port | toString) .Values.database.auth.database }}
{{- end }}

{{/*
Get the Spring datasource URL (JDBC format)
*/}}
{{- define "naver-hkt.springDatasourceUrl" -}}
{{- printf "jdbc:postgresql://%s:%s/%s" (printf "%s-database" (include "naver-hkt.name" .)) (.Values.database.service.port | toString) .Values.database.auth.database }}
{{- end }}

{{/*
Get the MinIO URL
*/}}
{{- define "naver-hkt.minioUrl" -}}
{{- printf "http://%s:%s" (printf "%s-minio" (include "naver-hkt.name" .)) (.Values.minio.service.apiPort | toString) }}
{{- end }}

{{/*
Get the AI Gateway URL
*/}}
{{- define "naver-hkt.aiGatewayUrl" -}}
{{- if and .Values.backend.env .Values.backend.env.AI_GATEWAY_URL }}
{{- .Values.backend.env.AI_GATEWAY_URL }}
{{- else }}
{{- printf "http://%s:%s" (printf "%s-agent-system" (include "naver-hkt.name" .)) (.Values.agentSystem.service.port | toString) }}
{{- end }}
{{- end }}