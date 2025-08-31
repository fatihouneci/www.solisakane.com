## Contibution

### 1. Cloner le projet en local
git clone https://github.com/fatihouneci/www.solisakane.com.git
cd nom-du-projet

### 2. Créer une branche pour vos modifications

On ne modifie jamais directement la branche main/master.

git checkout -b feature/ma-fonctionnalite

### 3. Travailler et faire des commits

Modifier/ajouter le code.

Sauvegarder les changements :

git add .
git commit -m "Ajout de la fonctionnalité X"

### 4. Pousser vos changements sur GitHub
git push origin feature/ma-fonctionnalite

### 5. Créer une Pull Request (PR)

Allez sur GitHub → votre dépôt → vous verrez un bouton "Compare & pull request".

Décrivez vos changements.

Soumettez la PR pour que vos collègues la relisent et valident.

### 6. Revue et validation

Les autres collaborateurs peuvent commenter, demander des modifications, ou approuver la PR.

Une fois validée, elle est fusionnée (merge) dans main.

### 7. Mettre son dépôt à jour

Avant de retravailler, il faut synchroniser son code avec le dépôt principal :

git checkout main
git pull origin main