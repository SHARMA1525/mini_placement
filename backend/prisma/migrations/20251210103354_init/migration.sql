-- CreateTable
CREATE TABLE "Students" (
    "student_id" SERIAL NOT NULL,
    "studentName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" BIGINT NOT NULL,
    "email" TEXT NOT NULL,
    "college" TEXT NOT NULL DEFAULT 'Unknown',
    "cgpa" TEXT,
    "yearOfPassing" TEXT,
    "resume_link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "companies" (
    "companyId" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "websiteUrl" TEXT,
    "companyType" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "jobs" (
    "jobId" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT,
    "stipend" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "skills" (
    "skillId" SERIAL NOT NULL,
    "skillName" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "Applications" (
    "applicationId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Applied',

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "_JobSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Students_phoneNumber_key" ON "Students"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_companyName_key" ON "companies"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skills_skillName_key" ON "skills"("skillName");

-- CreateIndex
CREATE UNIQUE INDEX "Applications_studentId_jobId_key" ON "Applications"("studentId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "_JobSkills_AB_unique" ON "_JobSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_JobSkills_B_index" ON "_JobSkills"("B");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("jobId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;
