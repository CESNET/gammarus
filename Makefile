PREFIX=/usr

containing = $(foreach v,$2,$(if $(findstring $1,$v),$v))
not-containing = $(foreach v,$2,$(if $(findstring $1,$v),,$v))

.PHONY: install install-services install-static-files install-nghttpx-device-specific

install-services: $(wildcard *.service)
	mkdir -p $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/
	cp $^ $(DESTDIR)$(PREFIX)/lib/systemd/system/
	$(foreach unit,$(call not-containing,@,$^),ln -sf ../$(unit) $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/;)

install-static-files: sdn-roadm-line sdn-roadm-add-drop sdn-roadm-coherent-a-d sdn-inline
	mkdir -p $(DESTDIR)$(PREFIX)/share/gammarus/static/
	mkdir -p $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/
	$(foreach device,$^,cp -a $(device) $(DESTDIR)$(PREFIX)/share/gammarus/static/;)
	$(foreach device,$^,ln -sf ../nghttpd@.service $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/nghttpd@$(device).service;)

install: install-services install-static-files
