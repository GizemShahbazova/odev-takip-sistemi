/* Giriş, kullanıcı profili ve öğretmene ait sınıflar ve sınıfa bağlı öğrenciler ve ödevler.
   Erişim yetkileri Firestore Security Rules tarafından uygulanır. */
(() => {
  const el = (id) => document.getElementById(id);
  const form = el('login-form');
  const loginButton = el('login-button');
  let auth, db, api, fs;
  let profileRequest = 0;
  let teacherUid = null;
  let listRequest = 0;
  let savingClass = false;
  let knownClasses = new Map();
  let selectedClass = null;
  let selectionVersion = 0;
  let studentListRequest = 0;
  let savingStudent = false;
  let assignmentListRequest = 0;
  let savingAssignment = false;
  let resultsRequest = 0;
  function clearResults() {
    ++resultsRequest;
    el('results-view').hidden = true;
    el('results-table').replaceChildren();
    el('results-wrap').hidden = true;
    el('results-title').textContent = 'Takip tablosu';
    el('results-summary').textContent = '';
    el('results-empty').hidden = true;
    el('results-load-status').textContent = '';
    el('results-load-status').className = '';
    el('refresh-results').disabled = false;
  }
  async function openResults(item) {
    if (!teacherUid || auth?.currentUser?.uid !== teacherUid || !knownClasses.has(item.id)) return;
    clearStudents();
    selectedClass = {id:item.id, name:item.name};
    el('classes-view').hidden = true;
    el('results-view').hidden = false;
    el('results-title').textContent = item.name + ' · Takip tablosu';
    el('results-title').focus();
    await loadResults();
  }
  async function loadResults() {
    const uid = teacherUid, session = profileRequest;
    const classId = selectedClass?.id, version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version)) return;
    const request = ++resultsRequest;
    const current = () => request === resultsRequest && sameClass(uid, session, classId, version);
    el('refresh-results').disabled = true;
    el('results-table').replaceChildren();
    el('results-wrap').hidden = true;
    el('results-empty').hidden = true;
    el('results-summary').textContent = '';
    el('results-load-status').className = '';
    el('results-load-status').textContent = 'Tamamlanma bilgileri yükleniyor…';
    try {
      const [studentRecords, assignmentRecords] = await Promise.all([
        fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'students')),
        fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'assignments'))
      ]);
      if (!current()) return;
      const students = studentRecords.docs.map(r => ({...r.data(), id:r.id}));
      const assignments = assignmentRecords.docs.map(r => ({...r.data(), id:r.id}));
      students.sort((a,b) => String(a.name).localeCompare(String(b.name), 'tr'));
      assignments.sort((a,b) => String(a.dueDate).localeCompare(String(b.dueDate)) || String(a.title).localeCompare(String(b.title), 'tr'));
      if (!students.length || !assignments.length) {
        el('results-empty').textContent = !students.length ? 'Bu sınıfta henüz öğrenci yok. Öğrenciler bölümünden ekleyebilirsiniz.' : 'Bu sınıfta henüz ödev yok. Ödevler bölümünden ekleyebilirsiniz.';
        el('results-empty').hidden = false;
        el('results-load-status').textContent = '';
        return;
      }
      const completions = await Promise.all(students.map(async student => {
        const result = await fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'students', student.id, 'completions'));
        return new Map(result.docs.map(r => [r.id, r.data()]));
      }));
      if (!current()) return;
      const table = el('results-table');
      const caption = document.createElement('caption');
      caption.textContent = selectedClass.name + ' · Öğrencilere göre ödev durumu';
      table.append(caption);
      const head = document.createElement('thead'), header = document.createElement('tr');
      const first = document.createElement('th');first.textContent = 'Öğrenci';first.setAttribute('scope','col');header.append(first);
      for (const assignment of assignments) {
        const cell = document.createElement('th');cell.setAttribute('scope','col');
        const label = document.createElement('span');label.textContent = assignment.title;
        const date = document.createElement('small');date.textContent = validDueDate(assignment.dueDate) ? assignment.dueDate.split('-').reverse().join('.') : 'Tarih belirtilmemiş';
        cell.append(label, date);header.append(cell);
      }
      const totalHeader = document.createElement('th');totalHeader.textContent = 'Tamamlanan';totalHeader.setAttribute('scope','col');header.append(totalHeader);head.append(header);table.append(head);
      const body = document.createElement('tbody');let total = 0;
      students.forEach((student,index) => {
        const row = document.createElement('tr'), label = document.createElement('th');
        label.setAttribute('scope','row');label.textContent = student.name;row.append(label);let done = 0;
        for (const assignment of assignments) {
          const cell = document.createElement('td');
          const completed = completions[index].get(assignment.id)?.completed === true;
          const badge = document.createElement('span');badge.className = completed ? 'completion-state done' : 'completion-state pending';
          badge.textContent = completed ? '✓ Tamamlandı' : 'Bekliyor';cell.append(badge);row.append(cell);
          if (completed) ++done;
        }
        const count = document.createElement('td');count.textContent = done + ' / ' + assignments.length;row.append(count);body.append(row);total += done;
      });
      table.append(body);
      el('results-wrap').hidden = false;
      el('results-summary').textContent = students.length + ' öğrenci · ' + assignments.length + ' ödev · ' + total + ' / ' + (students.length * assignments.length) + ' tamamlanan';
      el('results-load-status').textContent = '';
    } catch (error) {
      if (!current()) return;
      el('results-load-status').className = 'error';
      el('results-load-status').textContent = 'Takip bilgileri yüklenemedi. Bağlantınızı ve yeni erişim kurallarını kontrol edip Yenile’ye basın.';
    } finally {
      if (current()) el('refresh-results').disabled = false;
    }
  }
  el('refresh-results').addEventListener('click', loadResults);
  el('results-back').addEventListener('click', backToClasses);
  el('students-to-results').addEventListener('click', () => {if (selectedClass) return openResults(selectedClass);});
  el('assignments-to-results').addEventListener('click', () => {if (selectedClass) return openResults(selectedClass);});
  el('results-to-students').addEventListener('click', () => {if (selectedClass) return openStudents(selectedClass);});
  el('results-to-assignments').addEventListener('click', () => {if (selectedClass) return openAssignments(selectedClass);});
  let parentUid = null;
  let parentListRequest = 0;
  let savingCompletions = new Set();
  function clearParent() {
    savingCompletions = new Set();
    parentUid = null;
    ++parentListRequest;
    el('parent-view').hidden = true;
    el('parent-children').replaceChildren();
    el('parent-count').textContent = '—';
    el('parent-empty').hidden = true;
    el('parent-load-status').textContent = '';
    el('parent-load-status').className = '';
    el('refresh-parent').disabled = false;
  }
  function sameParent(uid, session, request) {
    return Boolean(uid) && parentUid === uid && auth?.currentUser?.uid === uid
      && profileRequest === session && parentListRequest === request;
  }
  function validRecordId(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 1500
      && !value.includes('/') && value !== '.' && value !== '..' && !/^__.*__$/.test(value);
  }
  function parentAssignment(item, context) {
    const row = document.createElement('li');
    const title = document.createElement('h3');
    title.textContent = item.title;
    const due = document.createElement('p');
    due.className = 'assignment-date';
    const date = document.createElement('time');
    date.textContent = validDueDate(item.dueDate) ? item.dueDate.split('-').reverse().join('.') : 'Tarih belirtilmemiş';
    if (validDueDate(item.dueDate)) date.setAttribute('datetime', item.dueDate);
    due.append(document.createTextNode('Son teslim: '), date);
    row.append(title, due);
    if (item.description) {
      const description = document.createElement('p');
      description.className = 'assignment-description';
      description.textContent = item.description;
      row.append(description);
    }
    let completed = context.completions.get(item.id)?.completed === true;
    const controls = document.createElement('div');
    controls.className = 'completion-controls';
    const state = document.createElement('span');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'completion-toggle';
    const message = document.createElement('p');
    message.className = 'completion-message';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    function renderState() {
      state.textContent = completed ? '✓ Tamamlandı' : 'Bekliyor';
      state.className = completed ? 'completion-state done' : 'completion-state pending';
      toggle.textContent = completed ? 'İşareti geri al' : 'Tamamlandı olarak işaretle';
      toggle.setAttribute('aria-label', context.studentName + ' · ' + item.title + ': ' + toggle.textContent);
    }
    renderState();
    controls.append(state, toggle);
    row.append(controls, message);
    toggle.addEventListener('click', async () => {
      const {uid, session, request, classId, studentId} = context;
      const key = classId + '/' + studentId + '/' + item.id;
      if (!sameParent(uid, session, request) || savingCompletions.has(key)) return;
      const next = !completed;
      savingCompletions.add(key);
      toggle.disabled = true;
      el('refresh-parent').disabled = true;
      message.textContent = 'Kaydediliyor…';
      message.className = 'completion-message';
      try {
        await fs.setDoc(fs.doc(db, 'classes', classId, 'students', studentId, 'completions', item.id), {
          completed: next, updatedBy: uid, updatedAt: fs.serverTimestamp()
        });
        if (!sameParent(uid, session, request)) return;
        completed = next;
        renderState();
        message.textContent = next ? 'Tamamlandı olarak kaydedildi.' : 'İşaret geri alındı.';
      } catch (error) {
        if (!sameParent(uid, session, request)) return;
        message.textContent = 'Kaydedilemedi. Bağlantınızı kontrol edip Yenile düğmesiyle durumu tekrar okuyun; sorun sürerse öğretmeninizle iletişime geçin.';
        message.className = 'completion-message error';
      } finally {
        if (sameParent(uid, session, request)) {
          savingCompletions.delete(key);
          toggle.disabled = false;
          el('refresh-parent').disabled = savingCompletions.size > 0;
        }
      }
    });
    return row;
  }
  async function loadParentChildren() {
    const uid = parentUid;
    const session = profileRequest;
    if (!uid || auth?.currentUser?.uid !== uid || savingCompletions.size > 0) return;
    const request = ++parentListRequest;
    el('refresh-parent').disabled = true;
    // Clear previous data immediately so revoked links cannot leave old cards on screen.
    el('parent-children').replaceChildren();
    el('parent-empty').hidden = true;
    el('parent-count').textContent = '—';
    el('parent-load-status').className = '';
    el('parent-load-status').textContent = 'Çocuğunuzun ödevleri yükleniyor…';
    try {
      const links = await fs.getDocsFromServer(fs.collection(db, 'users', uid, 'children'));
      if (!sameParent(uid, session, request)) return;
      const results = await Promise.allSettled(links.docs.map(async link => {
        const classId = link.id;
        const ids = link.data().studentIds;
        if (!validRecordId(classId) || !Array.isArray(ids) || ids.length === 0 || !ids.every(validRecordId)) {
          throw {code: 'parent/invalid-link'};
        }
        const studentIds = [...new Set(ids)];
        const [classRecord, assignmentRecords, studentRecords] = await Promise.all([
          fs.getDocFromServer(fs.doc(db, 'classes', classId)),
          fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'assignments')),
          Promise.all(studentIds.map(async studentId => {
            const [record, completedRecords] = await Promise.all([
              fs.getDocFromServer(fs.doc(db, 'classes', classId, 'students', studentId)),
              fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'students', studentId, 'completions'))
            ]);
            return {record, studentId, completions: new Map(completedRecords.docs.map(r => [r.id, r.data()]))};
          }))
        ]);
        if (!classRecord.exists() || studentRecords.some(student => !student.record.exists())) throw {code: 'parent/missing-record'};
        const assignments = assignmentRecords.docs.map(record => ({...record.data(), id: record.id}));
        assignments.sort((a,b) => String(a.dueDate).localeCompare(String(b.dueDate)) || String(a.title).localeCompare(String(b.title), 'tr'));
        return {classId, className: classRecord.data().name, students: studentRecords.map(student => ({...student.record.data(), id: student.studentId, completions: student.completions})), assignments};
      }));
      if (!sameParent(uid, session, request)) return;
      const cards = [];
      let failures = 0;
      for (const result of results) {
        if (result.status !== 'fulfilled') { ++failures; continue; }
        const {classId, className, students, assignments} = result.value;
        for (const student of students) {
          const section = document.createElement('section');
          section.className = 'child-card';
          const heading = document.createElement('h2');
          heading.textContent = student.name;
          const subtitle = document.createElement('p');
          subtitle.className = 'child-subtitle';
          subtitle.textContent = className + ' · ' + assignments.length + ' ödev';
          section.append(heading, subtitle);
          if (assignments.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'Bu sınıfta henüz ödev yok.';
            section.append(empty);
          } else {
            const list = document.createElement('ul');
            list.className = 'assignment-list';
            list.setAttribute('aria-label', student.name + ' için sınıf ödevleri');
            for (const item of assignments) list.append(parentAssignment(item, {uid, session, request, classId, studentId: student.id, studentName: student.name, completions: student.completions}));
            section.append(list);
          }
          cards.push({section, name: String(student.name)});
        }
      }
      cards.sort((a,b) => a.name.localeCompare(b.name, 'tr'));
      for (const card of cards) el('parent-children').append(card.section);
      el('parent-count').textContent = cards.length + ' öğrenci';
      el('parent-empty').hidden = links.docs.length !== 0;
      el('parent-load-status').className = failures ? 'error' : '';
      el('parent-load-status').textContent = failures ? 'Bazı öğrenci kayıtları yüklenemedi. Yenile düğmesiyle tekrar deneyin; sorun sürerse öğretmeninizle iletişime geçin.' : '';
    } catch (error) {
      if (!sameParent(uid, session, request)) return;
      el('parent-load-status').textContent = 'Ödevler yüklenemedi. Bağlantınızı kontrol edip Yenile düğmesiyle tekrar deneyin; sorun sürerse öğretmeninizle iletişime geçin.';
      el('parent-load-status').className = 'error';
    } finally {
      if (sameParent(uid, session, request)) el('refresh-parent').disabled = false;
    }
  }
  el('refresh-parent').addEventListener('click', loadParentChildren);
  function assignmentStatus(message, kind = '') {
    el('assignments-status').textContent = message;
    el('assignments-status').className = kind;
  }
  function clearAssignments() {
    ++assignmentListRequest;
    savingAssignment = false;
    el('assignments-view').hidden = true;
    el('assignments-title').textContent = 'Ödevler';
    el('assignments-list').replaceChildren();
    el('assignment-count').textContent = '—';
    el('assignments-empty').hidden = true;
    el('assignment-name').value = '';
    el('assignment-description').value = '';
    el('assignment-due-date').value = '';
    el('create-assignment').disabled = false;
    el('create-assignment').textContent = 'Ödev ekle';
    el('refresh-assignments').disabled = false;
    el('assignments-load-status').textContent = '';
    el('assignments-load-status').className = '';
    assignmentStatus('');
  }
  function validDueDate(value) {
    if (!/^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  async function openAssignments(item) {
    if (!teacherUid || auth?.currentUser?.uid !== teacherUid || !knownClasses.has(item.id)) return;
    clearStudents();
    selectedClass = {id: item.id, name: item.name};
    el('classes-view').hidden = true;
    el('assignments-view').hidden = false;
    el('assignments-title').textContent = item.name + ' · Ödevler';
    el('assignments-title').setAttribute('tabindex', '-1');
    el('assignments-title').focus();
    await loadAssignments();
  }
  async function loadAssignments() {
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version)) return;
    const request = ++assignmentListRequest;
    el('refresh-assignments').disabled = true;
    el('assignments-load-status').className = '';
    el('assignments-load-status').textContent = 'Ödevler yükleniyor…';
    try {
      const result = await fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'assignments'));
      if (request !== assignmentListRequest || !sameClass(uid, session, classId, version)) return;
      const assignments = result.docs.map(record => ({...record.data(), id: record.id}));
      assignments.sort((a,b) => String(a.dueDate).localeCompare(String(b.dueDate)) || String(a.title).localeCompare(String(b.title), 'tr'));
      el('assignments-list').replaceChildren();
      for (const item of assignments) {
        const row = document.createElement('li');
        const title = document.createElement('h3');
        title.textContent = item.title;
        const due = document.createElement('p');
        due.className = 'assignment-date';
        const date = document.createElement('time');
        date.textContent = validDueDate(item.dueDate) ? item.dueDate.split('-').reverse().join('.') : 'Tarih belirtilmemiş';
        if (validDueDate(item.dueDate)) date.setAttribute('datetime', item.dueDate);
        due.append(document.createTextNode('Son teslim: '), date);
        row.append(title, due);
        if (item.description) {
          const description = document.createElement('p');
          description.className = 'assignment-description';
          description.textContent = item.description;
          row.append(description);
        }
        el('assignments-list').append(row);
      }
      el('assignment-count').textContent = assignments.length + ' ödev';
      el('assignments-empty').hidden = assignments.length !== 0;
      el('assignments-load-status').textContent = '';
    } catch (error) {
      if (request !== assignmentListRequest || !sameClass(uid, session, classId, version)) return;
      el('assignments-load-status').textContent = error.code === 'permission-denied' ? 'Ödevler okunamadı. Yeni ödev erişim kurallarının yayımlandığını kontrol edin ve Yenile’ye basın.' : 'Ödevler yüklenemedi. Bağlantınızı kontrol edip Yenile’ye basın.';
      el('assignments-load-status').className = 'error';
    } finally {
      if (request === assignmentListRequest && sameClass(uid, session, classId, version)) el('refresh-assignments').disabled = false;
    }
  }
  el('assignments-back').addEventListener('click', backToClasses);
  el('students-to-assignments').addEventListener('click', () => {if (selectedClass) return openAssignments(selectedClass);});
  el('assignments-to-students').addEventListener('click', () => {if (selectedClass) return openStudents(selectedClass);});
  el('refresh-assignments').addEventListener('click', loadAssignments);
  el('assignment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version) || savingAssignment || el('assignments-view').hidden) return;
    const title = el('assignment-name').value.trim();
    const description = el('assignment-description').value.trim();
    const dueDate = el('assignment-due-date').value;
    if (!title || title.length > 120) {
      assignmentStatus('Ödev başlığını 1–120 karakter arasında yazın.', 'error');
      el('assignment-name').focus(); return;
    }
    if (description.length > 2000) {
      assignmentStatus('Açıklama en fazla 2000 karakter olabilir.', 'error');
      el('assignment-description').focus(); return;
    }
    if (!validDueDate(dueDate)) {
      assignmentStatus('2000–2099 arasında geçerli bir son teslim tarihi seçin.', 'error');
      el('assignment-due-date').focus(); return;
    }
    savingAssignment = true;
    el('create-assignment').disabled = true;
    el('create-assignment').textContent = 'Kaydediliyor…';
    assignmentStatus('Ödev kaydediliyor…');
    try {
      await fs.addDoc(fs.collection(db, 'classes', classId, 'assignments'), {title, description, dueDate, createdAt: fs.serverTimestamp()});
      if (!sameClass(uid, session, classId, version)) return;
      el('assignment-name').value = '';
      el('assignment-description').value = '';
      el('assignment-due-date').value = '';
      assignmentStatus('“' + title + '” bu sınıfa eklendi.', 'success');
      await loadAssignments();
    } catch (error) {
      if (!sameClass(uid, session, classId, version)) return;
      assignmentStatus(error.code === 'permission-denied' ? 'Ödev kaydedilemedi. Yeni ödev erişim kurallarının Firebase’de yayımlandığını kontrol edin.' : 'Ödev kaydedilemedi. Bağlantınızı kontrol edin; yeniden denemeden önce listeyi yenileyin.', 'error');
    } finally {
      if (sameClass(uid, session, classId, version)) {
        savingAssignment = false;
        el('create-assignment').disabled = false;
        el('create-assignment').textContent = 'Ödev ekle';
      }
    }
  });
  function studentStatus(message, kind = '') {
    el('students-status').textContent = message;
    el('students-status').className = kind;
  }
  function clearStudents() {
    clearResults();
    clearAssignments();
    selectedClass = null;
    ++selectionVersion;
    ++studentListRequest;
    savingStudent = false;
    el('students-view').hidden = true;
    el('students-title').textContent = 'Öğrenciler';
    el('students-list').replaceChildren();
    el('student-count').textContent = '—';
    el('students-empty').hidden = true;
    el('student-name').value = '';
    el('create-student').disabled = false;
    el('create-student').textContent = 'Öğrenci ekle';
    el('refresh-students').disabled = false;
    el('students-load-status').textContent = '';
    el('students-load-status').className = '';
    studentStatus('');
  }
  function sameClass(uid, session, classId, version) {
    return sameTeacher(uid, session) && selectedClass?.id === classId && version === selectionVersion;
  }
  async function openStudents(item) {
    if (!teacherUid || auth?.currentUser?.uid !== teacherUid || !knownClasses.has(item.id)) return;
    clearStudents();
    selectedClass = {id: item.id, name: item.name};
    el('classes-view').hidden = true;
    el('students-view').hidden = false;
    el('students-title').textContent = item.name + ' · Öğrenciler';
    el('students-title').setAttribute('tabindex', '-1');
    el('students-title').focus();
    await loadStudents();
  }
  function backToClasses() {
    clearStudents();
    if (teacherUid && auth?.currentUser?.uid === teacherUid) {
      el('classes-view').hidden = false;
      el('classes-title').setAttribute('tabindex', '-1');
      el('classes-title').focus();
    }
  }
  async function loadStudents() {
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version)) return;
    const request = ++studentListRequest;
    el('refresh-students').disabled = true;
    el('students-load-status').className = '';
    el('students-load-status').textContent = 'Öğrenciler yükleniyor…';
    try {
      const result = await fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'students'));
      if (request !== studentListRequest || !sameClass(uid, session, classId, version)) return;
      const students = result.docs.map(record => ({...record.data(), id: record.id}));
      students.sort((a,b) => String(a.name).localeCompare(String(b.name), 'tr'));
      el('students-list').replaceChildren();
      students.forEach((student, index) => {
        const row = document.createElement('li');
        const position = document.createElement('span');
        position.className = 'class-symbol student-position';
        position.textContent = String(index + 1);
        position.setAttribute('aria-hidden', 'true');
        const label = document.createElement('div');
        label.className = 'class-label';
        const name = document.createElement('strong');
        name.textContent = student.name;
        label.append(name);
        row.append(position, label);
        el('students-list').append(row);
      });
      el('student-count').textContent = students.length + ' öğrenci';
      el('students-empty').hidden = students.length !== 0;
      el('students-load-status').textContent = '';
    } catch (error) {
      if (request !== studentListRequest || !sameClass(uid, session, classId, version)) return;
      el('students-load-status').textContent = error.code === 'permission-denied' ? 'Öğrenciler okunamadı. Yeni öğrenci erişim kurallarının yayımlandığını kontrol edin ve Yenile’ye basın.' : 'Öğrenciler yüklenemedi. Bağlantınızı kontrol edip Yenile’ye basın.';
      el('students-load-status').className = 'error';
    } finally {
      if (request === studentListRequest && sameClass(uid, session, classId, version)) el('refresh-students').disabled = false;
    }
  }
  el('back-to-classes').addEventListener('click', backToClasses);
  el('menu-home').addEventListener('click', (event) => {
    if (teacherUid && auth?.currentUser?.uid === teacherUid) {event.preventDefault(); backToClasses();}
    else if (parentUid && auth?.currentUser?.uid === parentUid) {event.preventDefault(); el('parent-title').focus();}
  });
  el('refresh-students').addEventListener('click', loadStudents);
  el('student-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version) || savingStudent || el('students-view').hidden) return;
    const name = el('student-name').value.trim();
    if (!name || name.length > 100) {
      studentStatus('Öğrencinin adını ve soyadını 1–100 karakter arasında yazın.', 'error');
      el('student-name').focus();
      return;
    }
    savingStudent = true;
    el('create-student').disabled = true;
    el('create-student').textContent = 'Kaydediliyor…';
    studentStatus('Öğrenci kaydediliyor…');
    try {
      await fs.addDoc(fs.collection(db, 'classes', classId, 'students'), {name, createdAt: fs.serverTimestamp()});
      if (!sameClass(uid, session, classId, version)) return;
      el('student-name').value = '';
      studentStatus('“' + name + '” bu sınıfa eklendi.', 'success');
      await loadStudents();
    } catch (error) {
      if (!sameClass(uid, session, classId, version)) return;
      studentStatus(error.code === 'permission-denied' ? 'Öğrenci kaydedilemedi. Yeni öğrenci erişim kurallarının Firebase’de yayımlandığını kontrol edin.' : 'Öğrenci kaydedilemedi. Bağlantınızı kontrol edin; yeniden denemeden önce listeyi yenileyin.', 'error');
    } finally {
      if (sameClass(uid, session, classId, version)) {
        savingStudent = false;
        el('create-student').disabled = false;
        el('create-student').textContent = 'Öğrenci ekle';
      }
    }
  });
  function classStatus(message, kind = '') {
    el('classes-status').textContent = message;
    el('classes-status').className = kind;
  }
  function clearClasses() {
    clearParent();
    clearStudents();
    knownClasses.clear();
    teacherUid = null;
    ++listRequest;
    savingClass = false;
    el('classes-view').hidden = true;
    el('intro-view').hidden = false;
    el('menu-home').textContent = 'Ana sayfa';
    el('classes-list').replaceChildren();
    el('class-count').textContent = '—';
    el('classes-empty').hidden = true;
    el('class-name').value = '';
    el('create-class').disabled = false;
    el('create-class').textContent = 'Sınıf oluştur';
    el('refresh-classes').disabled = false;
    el('classes-load-status').textContent = '';
    classStatus('');
  }
  function sameTeacher(uid, session) {
    return uid === teacherUid && auth?.currentUser?.uid === uid && session === profileRequest;
  }
  async function loadClasses() {
    const uid = teacherUid;
    const session = profileRequest;
    if (!uid || !sameTeacher(uid, session)) return;
    const request = ++listRequest;
    el('refresh-classes').disabled = true;
    el('classes-load-status').className = '';
    el('classes-load-status').textContent = 'Sınıflarınız yükleniyor…';
    try {
      const q = fs.query(fs.collection(db, 'classes'), fs.where('teacherId', '==', uid));
      const result = await fs.getDocsFromServer(q);
      if (request !== listRequest || !sameTeacher(uid, session)) return;
      const classes = result.docs.map(record => ({...record.data(), id: record.id}));
      knownClasses = new Map(classes.map(item => [item.id, item]));
      classes.sort((a, b) => String(a.name).localeCompare(String(b.name), 'tr', {numeric: true}));
      el('classes-list').replaceChildren();
      for (const item of classes) {
        const row = document.createElement('li');
        const symbol = document.createElement('span');
        symbol.className = 'class-symbol';
        symbol.textContent = 'S';
        symbol.setAttribute('aria-hidden', 'true');
        const label = document.createElement('div');
        label.className = 'class-label';
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('p');
        const date = item.createdAt?.toDate?.();
        detail.textContent = date ? 'Oluşturuldu: ' + new Intl.DateTimeFormat('tr-TR').format(date) : 'Sınıf kaydı';
        label.append(name, detail);
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'class-open';
        open.textContent = 'Öğrenciler';
        open.setAttribute('aria-label', item.name + ' sınıfının öğrencileri');
        open.addEventListener('click', () => openStudents(item));
        const homework = document.createElement('button');
        homework.type = 'button';
        homework.className = 'class-open';
        homework.textContent = 'Ödevler';
        homework.setAttribute('aria-label', item.name + ' sınıfının ödevleri');
        homework.addEventListener('click', () => openAssignments(item));
        const actions = document.createElement('div');
        actions.className = 'class-actions';
        const track = document.createElement('button');
        track.type = 'button';track.className = 'class-open';track.textContent = 'Takip tablosu';
        track.setAttribute('aria-label', item.name + ' sınıfının ödev takip tablosu');
        track.addEventListener('click', () => openResults(item));
        actions.append(open, homework, track);
        row.append(symbol, label, actions);
        el('classes-list').append(row);
      }
      el('class-count').textContent = classes.length + ' sınıf';
      el('classes-empty').hidden = classes.length !== 0;
      el('classes-load-status').textContent = '';
    } catch (error) {
      if (request !== listRequest || !sameTeacher(uid, session)) return;
      el('classes-load-status').textContent = error.code === 'permission-denied' ? 'Sınıflar okunamadı. Yeni sınıf erişim kurallarının yayımlandığını kontrol edin ve Yenile’ye basın.' : 'Sınıflar yüklenemedi. Bağlantınızı kontrol edip Yenile’ye basın.';
      el('classes-load-status').className = 'error';
    } finally {
      if (request === listRequest && sameTeacher(uid, session)) el('refresh-classes').disabled = false;
    }
  }
  el('refresh-classes').addEventListener('click', loadClasses);
  el('class-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const uid = teacherUid;
    const session = profileRequest;
    if (!uid || !sameTeacher(uid, session) || savingClass) return;
    const name = el('class-name').value.trim();
    if (!name || name.length > 60) {
      classStatus('Sınıf adını 1–60 karakter arasında yazın.', 'error');
      el('class-name').focus();
      return;
    }
    savingClass = true;
    el('create-class').disabled = true;
    el('create-class').textContent = 'Kaydediliyor…';
    classStatus('Sınıf kaydediliyor…');
    try {
      await fs.addDoc(fs.collection(db, 'classes'), {name, teacherId: uid, createdAt: fs.serverTimestamp()});
      if (!sameTeacher(uid, session)) return;
      el('class-name').value = '';
      classStatus('“' + name + '” sınıfı oluşturuldu.', 'success');
      await loadClasses();
    } catch (error) {
      if (!sameTeacher(uid, session)) return;
      classStatus(error.code === 'permission-denied' ? 'Sınıf kaydedilemedi. Yeni sınıf erişim kurallarının Firebase’de yayımlandığını kontrol edin.' : 'Sınıf kaydedilemedi. Bağlantınızı kontrol edin; yeniden denemeden önce listeyi yenileyin.', 'error');
    } finally {
      if (sameTeacher(uid, session)) {
        savingClass = false;
        el('create-class').disabled = false;
        el('create-class').textContent = 'Sınıf oluştur';
      }
    }
  });
  function status(message, kind = '') {
    el('status').textContent = message;
    el('status').className = kind;
  }
  function errorText(error) {
    const code = error?.code || '';
    if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code)) return 'E-posta veya şifre hatalı. Bilgilerinizi kontrol edin.';
    if (code === 'auth/too-many-requests') return 'Çok fazla giriş denemesi yapıldı. Bir süre sonra yeniden deneyin.';
    if (code === 'auth/user-disabled') return 'Bu hesap devre dışı. Proje yöneticisiyle iletişime geçin.';
    if (code === 'auth/operation-not-allowed') return 'E-posta ve şifreyle giriş henüz etkin değil. Firebase Authentication ayarını kontrol edin.';
    if (code === 'auth/unauthorized-domain') return 'Bu sitenin adresini Firebase Authentication → Settings → Authorized domains listesine ekleyin.';
    if (code === 'permission-denied') return 'Kullanıcı kaydı okunamadı. Firestore Rules bölümündeki kuralı ve belgenin UID’sini kontrol edin.';
    if (code === 'auth/network-request-failed' || code === 'unavailable') return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.';
    return 'İşlem tamamlanamadı. Yeniden deneyin.' + (code ? ' Hata kodu: ' + code : '');
  }
  el('toggle-password').addEventListener('click', () => {
    const show = el('password').type === 'password';
    el('password').type = show ? 'text' : 'password';
    el('toggle-password').textContent = show ? 'Gizle' : 'Göster';
    el('toggle-password').setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
    el('toggle-password').setAttribute('aria-pressed', String(show));
  });
  el('reload-button').addEventListener('click', () => window.location.reload());
  async function loadProfile(user) {
    const request = ++profileRequest;
    clearClasses();
    el('profile-details').hidden = true;
    el('retry-profile').hidden = true;
    el('welcome').textContent = 'Hesap kontrol ediliyor…';
    status('Kullanıcı kaydınız okunuyor…');
    try {
      const record = await fs.getDocFromServer(fs.doc(db, 'users', user.uid));
      if (request !== profileRequest || auth.currentUser?.uid !== user.uid) return;
      if (!record.exists()) throw {code: 'profile/missing'};
      const profile = record.data();
      if (!['teacher', 'parent'].includes(profile.role)) throw {code: 'profile/invalid-role'};
      const name = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : 'Kullanıcı';
      el('welcome').textContent = 'Merhaba ' + name + '.';
      el('role').textContent = profile.role === 'teacher' ? 'Öğretmen' : 'Veli';
      el('profile-details').hidden = false;
      status('Hesabınız hazır.', 'success');
      if (profile.role === 'teacher') {
        teacherUid = user.uid;
        el('intro-view').hidden = true;
        el('classes-view').hidden = false;
        el('menu-home').textContent = 'Sınıflarım';
        await loadClasses();
      } else {
        parentUid = user.uid;
        el('intro-view').hidden = true;
        el('parent-view').hidden = false;
        el('menu-home').textContent = 'Çocuğumun ödevleri';
        await loadParentChildren();
      }
    } catch (error) {
      if (request !== profileRequest || auth.currentUser?.uid !== user.uid) return;
      el('welcome').textContent = 'Giriş yapıldı; profil okunamadı.';
      el('retry-profile').hidden = false;
      const message = error.code === 'profile/missing' ? 'Bu hesap için kullanıcı kaydı bulunamadı. Firestore’da users koleksiyonu altında, belge kimliği hesabınızın UID’si olacak şekilde kayıt oluşturun.' : error.code === 'profile/invalid-role' ? 'Kullanıcı rolü tanınmadı. Gizem’in kaydındaki role alanı teacher olmalı.' : errorText(error);
      status(message, 'error');
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!auth || loginButton.disabled) return;
    loginButton.disabled = true;
    loginButton.textContent = 'Giriş yapılıyor…';
    status('Hesabınız kontrol ediliyor…');
    const password = el('password').value;
    try {
      await api.signInWithEmailAndPassword(auth, el('email').value.trim(), password);
      el('password').value = '';
    } catch (error) {
      status(errorText(error), 'error');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Giriş yap';
    }
  });
  el('logout-button').addEventListener('click', async () => {
    el('logout-button').disabled = true;
    try { await api.signOut(auth); } catch (error) { status(errorText(error), 'error'); }
    finally { el('logout-button').disabled = false; }
  });
  el('retry-profile').addEventListener('click', () => { if (auth?.currentUser) loadProfile(auth.currentUser); });
  async function start() {
    try {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
      ]);
      api = authModule;
      fs = firestoreModule;
      const app = appModule.initializeApp({
        apiKey: 'AIzaSyCq-uHWYiFswYmQ92NUwmLgWINKZtBSz8w',
        authDomain: 'odev-takip-sistemi-6652a.firebaseapp.com',
        projectId: 'odev-takip-sistemi-6652a',
        storageBucket: 'odev-takip-sistemi-6652a.firebasestorage.app',
        messagingSenderId: '907905242882',
        appId: '1:907905242882:web:a04d2e9b7aad894fd7941b'
      });
      auth = api.getAuth(app);
      db = fs.getFirestore(app);
      await api.setPersistence(auth, api.browserSessionPersistence);
      api.onAuthStateChanged(auth, (user) => {
        ++profileRequest;
        clearClasses();
        el('login-view').hidden = Boolean(user);
        el('account-view').hidden = !user;
        el('profile-details').hidden = true;
        el('password').value = '';
        el('password').type = 'password';
        el('toggle-password').textContent = 'Göster';
        el('toggle-password').setAttribute('aria-label', 'Şifreyi göster');
        el('toggle-password').setAttribute('aria-pressed', 'false');
        el('welcome').textContent = '';
        el('role').textContent = '';
        el('account-email').textContent = user?.email || '';
        if (user) loadProfile(user);
        else status('Giriş yapabilirsiniz.');
      }, (error) => status(errorText(error), 'error'));
      loginButton.disabled = false;
      loginButton.textContent = 'Giriş yap';
    } catch (error) {
      loginButton.disabled = true;
      loginButton.textContent = 'Bağlantı kurulamadı';
      status('Firebase başlatılamadı. İnternet bağlantınızı kontrol edin. Sayfayı GitHub Pages adresinden veya yerel bir web sunucusundan açın.', 'error');
      el('reload-button').hidden = false;
    }
  }
  start();
})();
